import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { MercadoPagoWebhookEventsRepository } from '../../../../domain/subscription-checkout/application/repositories/mercadopago-webhook-events-repository';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaMercadoPagoWebhookEventsRepository implements MercadoPagoWebhookEventsRepository {
    constructor(private prisma: PrismaService) { }

    async existsByResourceIdAndTopic(resourceId: string, topic: string): Promise<boolean> {
        const row = await this.prisma.mercadoPagoWebhookEvent.findUnique({
            where: {
                resourceId_topic: { resourceId, topic },
            },
        });
        return !!row;
    }

    async create(input: { resourceId: string; topic: string; payload: unknown }): Promise<void> {
        await this.prisma.mercadoPagoWebhookEvent.create({
            data: {
                id: randomUUID(),
                resourceId: input.resourceId,
                topic: input.topic,
                payload:
                    input.payload === undefined ? undefined : (input.payload as Prisma.InputJsonValue),
            },
        });
    }
}
