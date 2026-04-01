import { Injectable } from '@nestjs/common';
import {
    ClientsRepository,
    UpsertClientRequest,
} from '../../../../domain/booking/application/repositories/clients-repository';
import { Client } from '../../../../domain/booking/enterprise/entities/client';
import { PrismaClientMapper } from '../mappers/prisma-client-mapper';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaClientsRepository implements ClientsRepository {
    constructor(private prisma: PrismaService) { }

    async upsertByStudioAndEmail(data: UpsertClientRequest): Promise<Client> {
        const client = await this.prisma.client.upsert({
            where: {
                studioId_email: {
                    studioId: data.studioId,
                    email: data.email,
                },
            },
            create: {
                studioId: data.studioId,
                userId: data.userId ?? null,
                name: data.name,
                email: data.email,
                phone: data.phone,
                bannerUrl: data.bannerUrl ?? null,
                notes: data.notes ?? null,
            },
            update: {
                userId: data.userId ?? undefined,
                name: data.name,
                phone: data.phone,
                bannerUrl: data.bannerUrl ?? null,
                notes: data.notes ?? null,
            },
        });

        return PrismaClientMapper.toDomain(client);
    }

    async findByStudioId(studioId: string): Promise<Client[]> {
        const clients = await this.prisma.client.findMany({
            where: { studioId },
            orderBy: { createdAt: 'desc' },
        });

        return clients.map(PrismaClientMapper.toDomain);
    }

    async findByStudioAndUserId(studioId: string, userId: string): Promise<Client | null> {
        const client = await this.prisma.client.findFirst({
            where: { studioId, userId },
        });

        if (!client) return null;
        return PrismaClientMapper.toDomain(client);
    }

    async save(client: Client): Promise<void> {
        await this.prisma.client.update({
            where: { id: client.id.toString() },
            data: {
                name: client.name,
                email: client.email,
                phone: client.phone,
                bannerUrl: client.bannerUrl,
                notes: client.notes,
            },
        });
    }

    async deleteById(clientId: string): Promise<void> {
        await this.prisma.client.delete({
            where: { id: clientId },
        });
    }
}
