import { Room } from '../../enterprise/entities/room';

export interface FindAvailableSlotsRequest {
    roomId: string;
    bookingDate: Date;
    openHour: number;
    closeHour: number;
}

export interface CreateRoomRequest {
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
    active?: boolean;
}

export interface UpdateRoomRequest extends CreateRoomRequest {
    id: string;
}

export abstract class RoomsRepository {
    abstract findById(roomId: string): Promise<Room | null>;
    abstract findByStudioId(studioId: string): Promise<Room[]>;
    abstract findAvailableSlotsByDate(params: FindAvailableSlotsRequest): Promise<number[]>;
    abstract create(data: CreateRoomRequest): Promise<Room>;
    abstract update(data: UpdateRoomRequest): Promise<Room>;
}
