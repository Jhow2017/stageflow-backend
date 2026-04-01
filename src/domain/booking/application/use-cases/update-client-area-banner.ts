import { Inject } from '@nestjs/common';
import { ClientsRepository } from '../repositories/clients-repository';
import { StudiosRepository } from '../repositories/studios-repository';
import { StudioNotFoundError } from './list-public-rooms';
import { ensureClientAreaAccess } from './client-area-access';
import { Client } from '../../enterprise/entities/client';

export interface UpdateClientAreaBannerRequest {
    studioSlug: string;
    userId: string;
    bannerUrl: string;
}

export interface UpdateClientAreaBannerResponse {
    client: Client;
}

export class UpdateClientAreaBannerUseCase {
    constructor(
        @Inject(StudiosRepository)
        private studiosRepository: StudiosRepository,
        @Inject(ClientsRepository)
        private clientsRepository: ClientsRepository,
    ) { }

    async execute({ studioSlug, userId, bannerUrl }: UpdateClientAreaBannerRequest): Promise<UpdateClientAreaBannerResponse> {
        const studio = await this.studiosRepository.findBySlug(studioSlug);
        if (!studio) throw new StudioNotFoundError();

        const client = await this.clientsRepository.findByStudioAndUserId(studio.id.toString(), userId);
        ensureClientAreaAccess(client);

        client.setBannerUrl(bannerUrl);
        await this.clientsRepository.save(client);

        return { client };
    }
}
