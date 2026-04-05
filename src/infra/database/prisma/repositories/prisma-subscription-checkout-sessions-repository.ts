import { Injectable } from '@nestjs/common';
import { PrismaSubscriptionCheckoutSessionMapper } from '../mappers/prisma-subscription-checkout-session-mapper';
import { PrismaService } from '../prisma.service';
import { SubscriptionCheckoutSessionsRepository } from '../../../../domain/subscription-checkout/application/repositories/subscription-checkout-sessions-repository';
import { SubscriptionCheckoutSession } from '../../../../domain/subscription-checkout/enterprise/entities/subscription-checkout-session';

@Injectable()
export class PrismaSubscriptionCheckoutSessionsRepository implements SubscriptionCheckoutSessionsRepository {
    constructor(private prisma: PrismaService) { }

    async create(session: SubscriptionCheckoutSession): Promise<void> {
        await this.prisma.subscriptionCheckout.create({
            data: {
                id: session.id.toString(),
                planTier: session.planTier,
                billingCycle: session.billingCycle,
                studioName: session.studioName,
                ownerName: session.ownerName,
                ownerEmail: session.ownerEmail,
                domainType: session.domainType,
                subdomain: session.subdomain,
                customDomain: session.customDomain,
                paymentMethod: session.paymentMethod,
                totalAmount: session.totalAmount,
                status: session.status,
                platformPaymentProvider: session.platformPaymentProvider,
                studioId: session.studioId,
                subscriberUserId: session.subscriberUserId,
                paymentReference: session.paymentReference,
                stripeCheckoutSessionId: session.stripeCheckoutSessionId,
                stripeCustomerId: session.stripeCustomerId,
                stripeSubscriptionId: session.stripeSubscriptionId,
                mercadoPagoPreapprovalId: session.mercadoPagoPreapprovalId,
                mercadoPagoPaymentId: session.mercadoPagoPaymentId,
                createdAt: session.createdAt,
                updatedAt: session.updatedAt,
            },
        });
    }

    async findById(id: string): Promise<SubscriptionCheckoutSession | null> {
        const session = await this.prisma.subscriptionCheckout.findUnique({
            where: { id },
        });

        if (!session) {
            return null;
        }

        return PrismaSubscriptionCheckoutSessionMapper.toDomain(session);
    }

    async findByMercadoPagoPaymentId(mercadoPagoPaymentId: string): Promise<SubscriptionCheckoutSession | null> {
        const session = await this.prisma.subscriptionCheckout.findFirst({
            where: { mercadoPagoPaymentId },
        });
        if (!session) return null;
        return PrismaSubscriptionCheckoutSessionMapper.toDomain(session);
    }

    async findByMercadoPagoPreapprovalId(mercadoPagoPreapprovalId: string): Promise<SubscriptionCheckoutSession | null> {
        const session = await this.prisma.subscriptionCheckout.findFirst({
            where: { mercadoPagoPreapprovalId },
        });
        if (!session) return null;
        return PrismaSubscriptionCheckoutSessionMapper.toDomain(session);
    }

    async save(session: SubscriptionCheckoutSession): Promise<void> {
        await this.prisma.subscriptionCheckout.update({
            where: { id: session.id.toString() },
            data: {
                status: session.status,
                studioId: session.studioId,
                subscriberUserId: session.subscriberUserId,
                paymentReference: session.paymentReference,
                stripeCheckoutSessionId: session.stripeCheckoutSessionId,
                stripeCustomerId: session.stripeCustomerId,
                stripeSubscriptionId: session.stripeSubscriptionId,
                mercadoPagoPreapprovalId: session.mercadoPagoPreapprovalId,
                mercadoPagoPaymentId: session.mercadoPagoPaymentId,
                updatedAt: session.updatedAt,
            },
        });
    }
}
