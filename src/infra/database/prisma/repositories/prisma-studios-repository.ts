import { Injectable } from '@nestjs/common';
import { Studio } from '../../../../domain/booking/enterprise/entities/studio';
import {
    CreateStudioRequest,
    StudiosRepository,
    UpdateStudioRequest,
} from '../../../../domain/booking/application/repositories/studios-repository';
import { PrismaStudioMapper } from '../mappers/prisma-studio-mapper';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaStudiosRepository implements StudiosRepository {
    constructor(private prisma: PrismaService) { }

    async findBySlug(slug: string): Promise<Studio | null> {
        const studio = await this.prisma.studio.findUnique({ where: { slug } });

        if (!studio) {
            return null;
        }

        return PrismaStudioMapper.toDomain(studio);
    }

    async findById(id: string): Promise<Studio | null> {
        const studio = await this.prisma.studio.findUnique({ where: { id } });

        if (!studio) {
            return null;
        }

        return PrismaStudioMapper.toDomain(studio);
    }

    async create(data: CreateStudioRequest): Promise<Studio> {
        const studio = await this.prisma.studio.create({
            data: {
                name: data.name,
                slug: data.slug,
                logoUrl: data.logoUrl ?? null,
                primaryColor: data.primaryColor ?? null,
                openHour: data.openHour,
                closeHour: data.closeHour,
                timezone: data.timezone ?? 'America/Sao_Paulo',
            },
        });

        return PrismaStudioMapper.toDomain(studio);
    }

    async update(data: UpdateStudioRequest): Promise<Studio> {
        const studio = await this.prisma.studio.update({
            where: { id: data.id },
            data: {
                name: data.name,
                slug: data.slug,
                logoUrl: data.logoUrl ?? null,
                primaryColor: data.primaryColor ?? null,
                openHour: data.openHour,
                closeHour: data.closeHour,
                timezone: data.timezone ?? 'America/Sao_Paulo',
            },
        });

        return PrismaStudioMapper.toDomain(studio);
    }

    async findAll(): Promise<Studio[]> {
        const studios = await this.prisma.studio.findMany({
            orderBy: { createdAt: 'desc' },
        });

        return studios.map(PrismaStudioMapper.toDomain);
    }
}
