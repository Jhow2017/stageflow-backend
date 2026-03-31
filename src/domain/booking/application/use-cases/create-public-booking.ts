import { Inject } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { UseCaseError } from '../../../../core/errors/use-case-error';
import { Role } from '../../../auth/enterprise/value-objects/role';
import { User } from '../../../auth/enterprise/entities/user';
import { HashGenerator } from '../../../auth/application/cryptography/hash-generator';
import { UsersRepository } from '../../../auth/application/repositories/users-repository';
import { Booking, BookingStatus, PaymentMethod } from '../../enterprise/entities/booking';
import { BookingsRepository } from '../repositories/bookings-repository';
import { ClientsRepository } from '../repositories/clients-repository';
import { RoomsRepository } from '../repositories/rooms-repository';
import { StudiosRepository } from '../repositories/studios-repository';

export interface CreatePublicBookingRequest {
    studioSlug: string;
    roomId: string;
    year: number;
    month: number;
    day: number;
    startHour: number;
    endHour: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    notes?: string;
    createAccount?: boolean;
    paymentMethod?: PaymentMethod;
    status?: BookingStatus;
}

export interface CreatePublicBookingResponse {
    booking: Booking;
    accountCreated: boolean;
}

export class InvalidBookingRangeError extends UseCaseError {
    constructor() {
        super('Invalid booking range');
    }
}

export class BookingOutOfStudioHoursError extends UseCaseError {
    constructor() {
        super('Booking is outside studio open hours');
    }
}

export class BookingConflictError extends UseCaseError {
    constructor() {
        super('There is already a booking in this time range');
    }
}

export class StudioNotFoundError extends UseCaseError {
    constructor() {
        super('Studio not found');
    }
}

export class RoomNotFoundError extends UseCaseError {
    constructor() {
        super('Room not found');
    }
}

export class PastDateNotAllowedError extends UseCaseError {
    constructor() {
        super('Past dates are not allowed');
    }
}

export class CreatePublicBookingUseCase {
    constructor(
        @Inject(StudiosRepository)
        private studiosRepository: StudiosRepository,
        @Inject(RoomsRepository)
        private roomsRepository: RoomsRepository,
        @Inject(ClientsRepository)
        private clientsRepository: ClientsRepository,
        @Inject(BookingsRepository)
        private bookingsRepository: BookingsRepository,
        @Inject(UsersRepository)
        private usersRepository: UsersRepository,
        @Inject(HashGenerator)
        private hashGenerator: HashGenerator,
    ) { }

    async execute({
        studioSlug,
        roomId,
        year,
        month,
        day,
        startHour,
        endHour,
        customerName,
        customerEmail,
        customerPhone,
        notes,
        createAccount = false,
        paymentMethod,
        status = 'CONFIRMED',
    }: CreatePublicBookingRequest): Promise<CreatePublicBookingResponse> {
        const studio = await this.studiosRepository.findBySlug(studioSlug);

        if (!studio) {
            throw new StudioNotFoundError();
        }

        const room = await this.roomsRepository.findById(roomId);

        if (!room || room.studioId !== studio.id.toString()) {
            throw new RoomNotFoundError();
        }

        const bookingDate = new Date(year, month - 1, day);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (bookingDate < today) {
            throw new PastDateNotAllowedError();
        }

        const duration = endHour - startHour;
        if (startHour >= endHour || duration < 1) {
            throw new InvalidBookingRangeError();
        }

        if (startHour < studio.openHour || endHour > studio.closeHour) {
            throw new BookingOutOfStudioHoursError();
        }

        const hasConflict = await this.bookingsRepository.hasConflict({
            roomId,
            bookingDate,
            startHour,
            endHour,
        });

        if (hasConflict) {
            throw new BookingConflictError();
        }

        let accountCreated = false;
        let userId: string | null = null;

        if (createAccount) {
            const existingUser = await this.usersRepository.findByEmail(customerEmail);

            if (existingUser) {
                userId = existingUser.id.toString();
            } else {
                const temporaryPassword = randomBytes(16).toString('hex');
                const hashedTemporaryPassword = await this.hashGenerator.hash(temporaryPassword);

                const user = User.create({
                    name: customerName,
                    email: customerEmail,
                    password: hashedTemporaryPassword,
                    role: Role.USER,
                    refreshToken: null,
                    resetPasswordToken: null,
                    resetPasswordExpires: null,
                });

                await this.usersRepository.create(user);
                userId = user.id.toString();
                accountCreated = true;
            }
        }

        const client = await this.clientsRepository.upsertByStudioAndEmail({
            studioId: studio.id.toString(),
            userId,
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
            notes,
        });

        const totalPrice = duration * room.pricePerHour;

        const booking = Booking.create({
            studioId: studio.id.toString(),
            roomId: room.id.toString(),
            clientId: client.id.toString(),
            bookingDate,
            startHour,
            endHour,
            totalPrice,
            status,
            paymentMethod: paymentMethod ?? null,
            paymentStatus: status === 'CONFIRMED' ? 'PAID' : 'PENDING',
            paymentRef: null,
        });

        await this.bookingsRepository.create(booking);

        return {
            booking,
            accountCreated,
        };
    }
}
