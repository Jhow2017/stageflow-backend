import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { StripeWebhookEventsRepository } from '../../../../domain/subscription-checkout/application/repositories/stripe-webhook-events-repository';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaStripeWebhookEventsRepository implements StripeWebhookEventsRepository {
    constructor(private prisma: PrismaService) { }

    async existsByEventId(eventId: string): Promise<boolean> {
        const event = await this.prisma.stripeWebhookEvent.findUnique({
            where: { eventId },
            select: { id: true },
        });

        return !!event;
    }

    async create(data: { eventId: string; eventType: string; payload?: Record<string, unknown> | null }): Promise<void> {
        await this.prisma.stripeWebhookEvent.create({
            data: {
                provider: 'stripe',
                eventId: data.eventId,
                eventType: data.eventType,
                payload: (data.payload as Prisma.InputJsonValue | null | undefined) ?? undefined,
            },
        });
    }
}
