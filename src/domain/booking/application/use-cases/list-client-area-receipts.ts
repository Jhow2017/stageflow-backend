import { Inject } from '@nestjs/common';
import { ClientsRepository } from '../repositories/clients-repository';
import { StudiosRepository } from '../repositories/studios-repository';
import { ensureClientAreaAccess } from './client-area-access';
import { StudioNotFoundError } from './list-public-rooms';

export interface ClientAreaReceipt {
    bookingId: string;
    status: 'UNAVAILABLE';
    message: string;
}

export interface ListClientAreaReceiptsRequest {
    studioSlug: string;
    userId: string;
}

export interface ListClientAreaReceiptsResponse {
    receipts: ClientAreaReceipt[];
}

export class ListClientAreaReceiptsUseCase {
    constructor(
        @Inject(StudiosRepository)
        private studiosRepository: StudiosRepository,
        @Inject(ClientsRepository)
        private clientsRepository: ClientsRepository,
    ) { }

    async execute({ studioSlug, userId }: ListClientAreaReceiptsRequest): Promise<ListClientAreaReceiptsResponse> {
        const studio = await this.studiosRepository.findBySlug(studioSlug);
        if (!studio) throw new StudioNotFoundError();

        const client = await this.clientsRepository.findByStudioAndUserId(studio.id.toString(), userId);
        ensureClientAreaAccess(client);

        return { receipts: [] };
    }
}
