import { Prisma } from '@prisma/client';
import { UniqueEntityID } from '../../../../core/entities/unique-entity-id';
import { Studio } from '../../../../domain/booking/enterprise/entities/studio';

type PrismaStudio = Prisma.StudioGetPayload<Record<string, never>>;

export class PrismaStudioMapper {
    static toDomain(raw: PrismaStudio): Studio {
        return Studio.create(
            {
                ownerUserId: raw.ownerUserId,
                stripeConnectedAccountId: raw.stripeConnectedAccountId,
                stripeOnboardingComplete: raw.stripeOnboardingComplete,
                stripeChargesEnabled: raw.stripeChargesEnabled,
                stripePayoutsEnabled: raw.stripePayoutsEnabled,
                stripeDetailsSubmitted: raw.stripeDetailsSubmitted,
                stripeRequirementsCurrentlyDue: Array.isArray(raw.stripeRequirementsCurrentlyDue)
                    ? (raw.stripeRequirementsCurrentlyDue as string[])
                    : null,
                stripeRequirementsEventuallyDue: Array.isArray(raw.stripeRequirementsEventuallyDue)
                    ? (raw.stripeRequirementsEventuallyDue as string[])
                    : null,
                stripeConnectStatus: raw.stripeConnectStatus,
                name: raw.name,
                slug: raw.slug,
                planTier: raw.planTier,
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
