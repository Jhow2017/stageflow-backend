import { Injectable } from '@nestjs/common';
import {
    BookingsRepository,
    FindConflictRequest,
} from '../../../../domain/booking/application/repositories/bookings-repository';
import { Booking } from '../../../../domain/booking/enterprise/entities/booking';
import { PrismaBookingMapper } from '../mappers/prisma-booking-mapper';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaBookingsRepository implements BookingsRepository {
    constructor(private prisma: PrismaService) { }

    async create(booking: Booking): Promise<void> {
        const data = PrismaBookingMapper.toPrisma(booking);

        await this.prisma.booking.create({ data });
    }

    async hasConflict({
        roomId,
        bookingDate,
        startHour,
        endHour,
    }: FindConflictRequest): Promise<boolean> {
        const conflict = await this.prisma.booking.findFirst({
            where: {
                roomId,
                bookingDate,
                status: {
                    not: 'CANCELLED',
                },
                AND: [
                    {
                        startHour: {
                            lt: endHour,
                        },
                    },
                    {
                        endHour: {
                            gt: startHour,
                        },
                    },
                ],
            },
            select: {
                id: true,
            },
        });

        return !!conflict;
    }

    async findByStudioId(studioId: string): Promise<Booking[]> {
        const bookings = await this.prisma.booking.findMany({
            where: { studioId },
            orderBy: [{ bookingDate: 'asc' }, { startHour: 'asc' }],
        });

        return bookings.map(PrismaBookingMapper.toDomain);
    }
}
