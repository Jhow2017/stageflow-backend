import { Inject } from '@nestjs/common';
import { Booking } from '../../enterprise/entities/booking';
import { BookingsRepository } from '../repositories/bookings-repository';
import { StudiosRepository } from '../repositories/studios-repository';
import { StudioNotFoundError } from './list-public-rooms';

export interface ListStudioBookingsRequest {
    studioSlug: string;
}

export interface ListStudioBookingsResponse {
    bookings: Booking[];
}

export class ListStudioBookingsUseCase {
    constructor(
        @Inject(StudiosRepository)
        private studiosRepository: StudiosRepository,
        @Inject(BookingsRepository)
        private bookingsRepository: BookingsRepository,
    ) { }

    async execute({ studioSlug }: ListStudioBookingsRequest): Promise<ListStudioBookingsResponse> {
        const studio = await this.studiosRepository.findBySlug(studioSlug);

        if (!studio) {
            throw new StudioNotFoundError();
        }

        const bookings = await this.bookingsRepository.findByStudioId(studio.id.toString());

        return { bookings };
    }
}
