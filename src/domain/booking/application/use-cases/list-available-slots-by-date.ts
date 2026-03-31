import { Inject } from '@nestjs/common';
import { UseCaseError } from '../../../../core/errors/use-case-error';
import { StudiosRepository } from '../repositories/studios-repository';
import { RoomsRepository } from '../repositories/rooms-repository';

export interface ListAvailableSlotsByDateRequest {
    studioSlug: string;
    roomId: string;
    year: number;
    month: number;
    day: number;
}

export interface ListAvailableSlotsByDateResponse {
    availableSlots: number[];
}

export class RoomNotFoundError extends UseCaseError {
    constructor() {
        super('Room not found');
    }
}

export class StudioNotFoundError extends UseCaseError {
    constructor() {
        super('Studio not found');
    }
}

export class PastDateNotAllowedError extends UseCaseError {
    constructor() {
        super('Past dates are not allowed');
    }
}

export class ListAvailableSlotsByDateUseCase {
    constructor(
        @Inject(StudiosRepository)
        private studiosRepository: StudiosRepository,
        @Inject(RoomsRepository)
        private roomsRepository: RoomsRepository,
    ) { }

    async execute({
        studioSlug,
        roomId,
        year,
        month,
        day,
    }: ListAvailableSlotsByDateRequest): Promise<ListAvailableSlotsByDateResponse> {
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

        const availableSlots = await this.roomsRepository.findAvailableSlotsByDate({
            roomId,
            bookingDate,
            openHour: studio.openHour,
            closeHour: studio.closeHour,
        });

        return {
            availableSlots,
        };
    }
}
