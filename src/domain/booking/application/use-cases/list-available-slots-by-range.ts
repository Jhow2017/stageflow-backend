import { Inject } from '@nestjs/common';
import { UseCaseError } from '../../../../core/errors/use-case-error';
import { RoomsRepository } from '../repositories/rooms-repository';
import { StudiosRepository } from '../repositories/studios-repository';

export interface ListAvailableSlotsByRangeRequest {
    studioSlug: string;
    roomId: string;
    startDate: string;
    endDate: string;
}

export interface ListAvailableSlotsByRangeResponse {
    availabilityByDate: Record<string, number[]>;
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

export class InvalidDateRangeError extends UseCaseError {
    constructor() {
        super('Invalid date range');
    }
}

function parseDateOnly(value: string): Date {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
}

function formatDateKey(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

export class ListAvailableSlotsByRangeUseCase {
    constructor(
        @Inject(StudiosRepository)
        private studiosRepository: StudiosRepository,
        @Inject(RoomsRepository)
        private roomsRepository: RoomsRepository,
    ) { }

    async execute({
        studioSlug,
        roomId,
        startDate,
        endDate,
    }: ListAvailableSlotsByRangeRequest): Promise<ListAvailableSlotsByRangeResponse> {
        const studio = await this.studiosRepository.findBySlug(studioSlug);
        if (!studio) throw new StudioNotFoundError();

        const room = await this.roomsRepository.findById(roomId);
        if (!room || room.studioId !== studio.id.toString()) throw new RoomNotFoundError();

        const start = parseDateOnly(startDate);
        const end = parseDateOnly(endDate);
        if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
            throw new InvalidDateRangeError();
        }

        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (start < today) throw new PastDateNotAllowedError();

        const diffMs = end.getTime() - start.getTime();
        const daySpan = Math.floor(diffMs / (24 * 60 * 60 * 1000));
        if (daySpan > 31) throw new InvalidDateRangeError();

        const availabilityByDate: Record<string, number[]> = {};
        const cursor = new Date(start);
        while (cursor <= end) {
            const slots = await this.roomsRepository.findAvailableSlotsByDate({
                roomId,
                bookingDate: new Date(cursor),
                openHour: studio.openHour,
                closeHour: studio.closeHour,
            });
            availabilityByDate[formatDateKey(cursor)] = slots;
            cursor.setDate(cursor.getDate() + 1);
        }

        return { availabilityByDate };
    }
}
