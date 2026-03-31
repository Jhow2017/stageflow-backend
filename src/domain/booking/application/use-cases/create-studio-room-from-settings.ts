import { Inject } from '@nestjs/common';
import { UseCaseError } from '../../../../core/errors/use-case-error';
import { Room } from '../../enterprise/entities/room';
import { RoomsRepository } from '../repositories/rooms-repository';
import { StudiosRepository } from '../repositories/studios-repository';

export interface CreateStudioRoomFromSettingsRequest {
    studioId: string;
    name: string;
    type: string;
    description: string;
    pricePerHour: number;
    capacity: number;
    features: string[];
    imageUrl?: string | null;
    rating?: number | null;
    reviewCount?: number | null;
}

export interface CreateStudioRoomFromSettingsResponse {
    room: Room;
}

export class StudioNotFoundError extends UseCaseError {
    constructor() {
        super('Studio not found');
    }
}

export class RoomLimitReachedError extends UseCaseError {
    constructor() {
        super('Room limit reached for current plan');
    }
}

export class InvalidRoomDataError extends UseCaseError {
    constructor() {
        super('Invalid room data');
    }
}

function getPlanRoomLimit(planTier: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'): number | null {
    if (planTier === 'STARTER') return 1;
    if (planTier === 'PROFESSIONAL') return 3;
    return null;
}

export class CreateStudioRoomFromSettingsUseCase {
    constructor(
        @Inject(StudiosRepository)
        private studiosRepository: StudiosRepository,
        @Inject(RoomsRepository)
        private roomsRepository: RoomsRepository,
    ) { }

    async execute(data: CreateStudioRoomFromSettingsRequest): Promise<CreateStudioRoomFromSettingsResponse> {
        if (data.pricePerHour <= 0 || data.capacity <= 0) {
            throw new InvalidRoomDataError();
        }

        const studio = await this.studiosRepository.findById(data.studioId);
        if (!studio) {
            throw new StudioNotFoundError();
        }

        const roomLimit = getPlanRoomLimit(studio.planTier);
        if (roomLimit !== null) {
            const currentRooms = await this.roomsRepository.countByStudioId(data.studioId);
            if (currentRooms >= roomLimit) {
                throw new RoomLimitReachedError();
            }
        }

        const room = await this.roomsRepository.create({
            studioId: data.studioId,
            name: data.name,
            type: data.type,
            description: data.description,
            pricePerHour: data.pricePerHour,
            capacity: data.capacity,
            features: data.features,
            imageUrl: data.imageUrl,
            rating: data.rating,
            reviewCount: data.reviewCount,
            active: true,
        });

        return { room };
    }
}
