import { Inject } from '@nestjs/common';
import { ClientsRepository } from '../repositories/clients-repository';
import { StudiosRepository } from '../repositories/studios-repository';
import { StudioNotFoundError } from './list-public-rooms';
import { ensureClientAreaAccess } from './client-area-access';
import { Client } from '../../enterprise/entities/client';

export interface UpdateClientAreaProfileRequest {
    studioSlug: string;
    userId: string;
    name: string;
    email: string;
    phone: string;
    notes?: string | null;
}

export interface UpdateClientAreaProfileResponse {
    client: Client;
}

export class UpdateClientAreaProfileUseCase {
    constructor(
        @Inject(StudiosRepository)
        private studiosRepository: StudiosRepository,
        @Inject(ClientsRepository)
        private clientsRepository: ClientsRepository,
    ) { }

    async execute(data: UpdateClientAreaProfileRequest): Promise<UpdateClientAreaProfileResponse> {
        const studio = await this.studiosRepository.findBySlug(data.studioSlug);
        if (!studio) throw new StudioNotFoundError();

        const client = await this.clientsRepository.findByStudioAndUserId(studio.id.toString(), data.userId);
        ensureClientAreaAccess(client);

        client.updateProfile({
            name: data.name,
            email: data.email,
            phone: data.phone,
            notes: data.notes,
        });
        await this.clientsRepository.save(client);

        return { client };
    }
}
