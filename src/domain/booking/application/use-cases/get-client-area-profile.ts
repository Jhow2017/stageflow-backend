import { Inject } from '@nestjs/common';
import { ClientsRepository } from '../repositories/clients-repository';
import { StudiosRepository } from '../repositories/studios-repository';
import { StudioNotFoundError } from './list-public-rooms';
import { ensureClientAreaAccess } from './client-area-access';
import { Client } from '../../enterprise/entities/client';

export interface GetClientAreaProfileRequest {
    studioSlug: string;
    userId: string;
}

export interface GetClientAreaProfileResponse {
    client: Client;
}

export class GetClientAreaProfileUseCase {
    constructor(
        @Inject(StudiosRepository)
        private studiosRepository: StudiosRepository,
        @Inject(ClientsRepository)
        private clientsRepository: ClientsRepository,
    ) { }

    async execute({ studioSlug, userId }: GetClientAreaProfileRequest): Promise<GetClientAreaProfileResponse> {
        const studio = await this.studiosRepository.findBySlug(studioSlug);
        if (!studio) throw new StudioNotFoundError();

        const client = await this.clientsRepository.findByStudioAndUserId(studio.id.toString(), userId);
        ensureClientAreaAccess(client);

        return { client };
    }
}
