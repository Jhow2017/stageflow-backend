import { Inject } from '@nestjs/common';
import { UseCaseError } from '../../../../core/errors/use-case-error';
import { Room } from '../../enterprise/entities/room';
import { StudiosRepository } from '../repositories/studios-repository';
import { RoomsRepository } from '../repositories/rooms-repository';

export interface ListPublicRoomsRequest {
    studioSlug: string;
}

export interface ListPublicRoomsResponse {
    rooms: Room[];
}

export class StudioNotFoundError extends UseCaseError {
    constructor() {
        super('Studio not found');
    }
}

export class ListPublicRoomsUseCase {
    constructor(
        @Inject(StudiosRepository)
        private studiosRepository: StudiosRepository,
        @Inject(RoomsRepository)
        private roomsRepository: RoomsRepository,
    ) { }

    async execute({ studioSlug }: ListPublicRoomsRequest): Promise<ListPublicRoomsResponse> {
        const studio = await this.studiosRepository.findBySlug(studioSlug);

        if (!studio) {
            throw new StudioNotFoundError();
        }

        const rooms = await this.roomsRepository.findByStudioId(studio.id.toString());

        return {
            rooms: rooms.filter((room) => room.active),
        };
    }
}
