import { Prisma } from '@prisma/client';
import { UniqueEntityID } from '../../../../core/entities/unique-entity-id';
import { Room } from '../../../../domain/booking/enterprise/entities/room';

type PrismaRoom = Prisma.RoomGetPayload<Record<string, never>>;

export class PrismaRoomMapper {
    static toDomain(raw: PrismaRoom): Room {
        return Room.create(
            {
                studioId: raw.studioId,
                name: raw.name,
                type: raw.type,
                description: raw.description,
                pricePerHour: Number(raw.pricePerHour),
                capacity: raw.capacity,
                features: raw.features as string[],
                imageUrl: raw.imageUrl,
                rating: raw.rating ? Number(raw.rating) : null,
                reviewCount: raw.reviewCount,
                active: raw.active,
                createdAt: raw.createdAt,
                updatedAt: raw.updatedAt,
            },
            new UniqueEntityID(raw.id),
        );
    }
}
