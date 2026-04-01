import { Inject } from '@nestjs/common';
import { Booking } from '../../enterprise/entities/booking';
import { BookingsRepository } from '../repositories/bookings-repository';
import { ClientsRepository } from '../repositories/clients-repository';
import { StudiosRepository } from '../repositories/studios-repository';
import { ensureClientAreaAccess } from './client-area-access';
import { StudioNotFoundError } from './list-public-rooms';

export interface ListClientAreaBookingsRequest {
    studioSlug: string;
    userId: string;
}

export interface ListClientAreaBookingsResponse {
    bookings: Booking[];
}

export class ListClientAreaBookingsUseCase {
    constructor(
        @Inject(StudiosRepository)
        private studiosRepository: StudiosRepository,
        @Inject(ClientsRepository)
        private clientsRepository: ClientsRepository,
        @Inject(BookingsRepository)
        private bookingsRepository: BookingsRepository,
    ) { }

    async execute({ studioSlug, userId }: ListClientAreaBookingsRequest): Promise<ListClientAreaBookingsResponse> {
        const studio = await this.studiosRepository.findBySlug(studioSlug);
        if (!studio) throw new StudioNotFoundError();

        const client = await this.clientsRepository.findByStudioAndUserId(studio.id.toString(), userId);
        ensureClientAreaAccess(client);

        const bookings = await this.bookingsRepository.findByStudioIdAndClientId(
            studio.id.toString(),
            client.id.toString(),
        );

        return { bookings };
    }
}
