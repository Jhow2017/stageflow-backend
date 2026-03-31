import { Inject } from '@nestjs/common';
import { Client } from '../../enterprise/entities/client';
import { ClientsRepository } from '../repositories/clients-repository';
import { StudiosRepository } from '../repositories/studios-repository';
import { StudioNotFoundError } from './list-public-rooms';

export interface ListStudioClientsRequest {
    studioSlug: string;
}

export interface ListStudioClientsResponse {
    clients: Client[];
}

export class ListStudioClientsUseCase {
    constructor(
        @Inject(StudiosRepository)
        private studiosRepository: StudiosRepository,
        @Inject(ClientsRepository)
        private clientsRepository: ClientsRepository,
    ) { }

    async execute({ studioSlug }: ListStudioClientsRequest): Promise<ListStudioClientsResponse> {
        const studio = await this.studiosRepository.findBySlug(studioSlug);

        if (!studio) {
            throw new StudioNotFoundError();
        }

        const clients = await this.clientsRepository.findByStudioId(studio.id.toString());

        return { clients };
    }
}
