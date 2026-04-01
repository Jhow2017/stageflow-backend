import { Inject } from '@nestjs/common';
import { ClientsRepository } from '../repositories/clients-repository';
import { StudiosRepository } from '../repositories/studios-repository';
import { ensureClientAreaAccess } from './client-area-access';
import { StudioNotFoundError } from './list-public-rooms';

export interface DeleteClientAreaAccountRequest {
    studioSlug: string;
    userId: string;
}

export interface DeleteClientAreaAccountResponse {
    message: string;
}

export class DeleteClientAreaAccountUseCase {
    constructor(
        @Inject(StudiosRepository)
        private studiosRepository: StudiosRepository,
        @Inject(ClientsRepository)
        private clientsRepository: ClientsRepository,
    ) { }

    async execute({ studioSlug, userId }: DeleteClientAreaAccountRequest): Promise<DeleteClientAreaAccountResponse> {
        const studio = await this.studiosRepository.findBySlug(studioSlug);
        if (!studio) throw new StudioNotFoundError();

        const client = await this.clientsRepository.findByStudioAndUserId(studio.id.toString(), userId);
        ensureClientAreaAccess(client);

        await this.clientsRepository.deleteById(client.id.toString());

        return { message: 'Conta do cliente removida com sucesso' };
    }
}
