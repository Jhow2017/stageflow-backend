import { Prisma } from '@prisma/client';
import { UniqueEntityID } from '../../../../core/entities/unique-entity-id';
import { Studio } from '../../../../domain/booking/enterprise/entities/studio';

type PrismaStudio = Prisma.StudioGetPayload<Record<string, never>>;

export class PrismaStudioMapper {
    static toDomain(raw: PrismaStudio): Studio {
        return Studio.create(
            {
                name: raw.name,
                slug: raw.slug,
                logoUrl: raw.logoUrl,
                primaryColor: raw.primaryColor,
                openHour: raw.openHour,
                closeHour: raw.closeHour,
                timezone: raw.timezone,
                createdAt: raw.createdAt,
                updatedAt: raw.updatedAt,
            },
            new UniqueEntityID(raw.id),
        );
    }
}
