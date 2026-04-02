import { Prisma } from '@prisma/client';
import { UniqueEntityID } from '../../../../core/entities/unique-entity-id';
import { SubscriptionCheckoutSession } from '../../../../domain/subscription-checkout/enterprise/entities/subscription-checkout-session';

type PrismaSubscriptionCheckoutSession = Prisma.SubscriptionCheckoutGetPayload<Record<string, never>>;

export class PrismaSubscriptionCheckoutSessionMapper {
    static toDomain(raw: PrismaSubscriptionCheckoutSession): SubscriptionCheckoutSession {
        return SubscriptionCheckoutSession.create(
            {
                planTier: raw.planTier,
                billingCycle: raw.billingCycle as 'MONTHLY' | 'ANNUAL',
                studioName: raw.studioName,
                ownerName: raw.ownerName,
                ownerEmail: raw.ownerEmail,
                domainType: raw.domainType as 'SUBDOMAIN' | 'CUSTOM_DOMAIN',
                subdomain: raw.subdomain,
                customDomain: raw.customDomain,
                paymentMethod: raw.paymentMethod as 'CARD' | 'PIX' | 'BOLETO',
                totalAmount: Number(raw.totalAmount),
                status: raw.status,
                studioId: raw.studioId,
                subscriberUserId: raw.subscriberUserId,
                paymentReference: raw.paymentReference,
                stripeCheckoutSessionId: raw.stripeCheckoutSessionId,
                stripeCustomerId: raw.stripeCustomerId,
                stripeSubscriptionId: raw.stripeSubscriptionId,
                createdAt: raw.createdAt,
                updatedAt: raw.updatedAt,
            },
            new UniqueEntityID(raw.id),
        );
    }
}
