import { Prisma } from '@prisma/client';
import { UniqueEntityID } from '../../../../core/entities/unique-entity-id';
import { Client } from '../../../../domain/booking/enterprise/entities/client';

type PrismaClientModel = Prisma.ClientGetPayload<Record<string, never>>;

export class PrismaClientMapper {
    static toDomain(raw: PrismaClientModel): Client {
        return Client.create(
            {
                studioId: raw.studioId,
                userId: raw.userId,
                name: raw.name,
                email: raw.email,
                phone: raw.phone,
                bannerUrl: raw.bannerUrl,
                notes: raw.notes,
            },
            new UniqueEntityID(raw.id),
        );
    }
}
