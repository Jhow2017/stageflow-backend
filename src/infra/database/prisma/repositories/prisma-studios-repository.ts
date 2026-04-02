import { Injectable } from '@nestjs/common';
import { Studio } from '../../../../domain/booking/enterprise/entities/studio';
import {
    CreateStudioRequest,
    StudioGlobalSummary,
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

    async findByStripeConnectedAccountId(accountId: string): Promise<Studio | null> {
        const studio = await this.prisma.studio.findFirst({
            where: { stripeConnectedAccountId: accountId },
        });
        if (!studio) return null;
        return PrismaStudioMapper.toDomain(studio);
    }

    async create(data: CreateStudioRequest): Promise<Studio> {
        const studio = await this.prisma.studio.create({
            data: {
                ownerUserId: data.ownerUserId ?? null,
                stripeConnectedAccountId: data.stripeConnectedAccountId ?? null,
                stripeOnboardingComplete: data.stripeOnboardingComplete ?? false,
                stripeChargesEnabled: data.stripeChargesEnabled ?? false,
                stripePayoutsEnabled: data.stripePayoutsEnabled ?? false,
                stripeDetailsSubmitted: data.stripeDetailsSubmitted ?? false,
                stripeRequirementsCurrentlyDue: data.stripeRequirementsCurrentlyDue ?? undefined,
                stripeRequirementsEventuallyDue: data.stripeRequirementsEventuallyDue ?? undefined,
                stripeConnectStatus: data.stripeConnectStatus ?? null,
                name: data.name,
                slug: data.slug,
                planTier: data.planTier,
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
                ownerUserId: data.ownerUserId ?? null,
                stripeConnectedAccountId: data.stripeConnectedAccountId ?? undefined,
                stripeOnboardingComplete: data.stripeOnboardingComplete ?? undefined,
                stripeChargesEnabled: data.stripeChargesEnabled ?? undefined,
                stripePayoutsEnabled: data.stripePayoutsEnabled ?? undefined,
                stripeDetailsSubmitted: data.stripeDetailsSubmitted ?? undefined,
                stripeRequirementsCurrentlyDue: data.stripeRequirementsCurrentlyDue ?? undefined,
                stripeRequirementsEventuallyDue: data.stripeRequirementsEventuallyDue ?? undefined,
                stripeConnectStatus: data.stripeConnectStatus ?? undefined,
                name: data.name,
                slug: data.slug,
                planTier: data.planTier,
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

    async findAllWithSummary(): Promise<StudioGlobalSummary[]> {
        const studios = await this.prisma.studio.findMany({
            include: {
                _count: {
                    select: {
                        rooms: true,
                        bookings: true,
                        clients: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return studios.map((item) => ({
            studio: PrismaStudioMapper.toDomain(item),
            roomsCount: item._count.rooms,
            bookingsCount: item._count.bookings,
            clientsCount: item._count.clients,
            status: item._count.rooms > 0 ? 'ACTIVE' : 'PENDING_SETUP',
        }));
    }

    async findByIdWithSummary(id: string): Promise<StudioGlobalSummary | null> {
        const studio = await this.prisma.studio.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        rooms: true,
                        bookings: true,
                        clients: true,
                    },
                },
            },
        });

        if (!studio) {
            return null;
        }

        return {
            studio: PrismaStudioMapper.toDomain(studio),
            roomsCount: studio._count.rooms,
            bookingsCount: studio._count.bookings,
            clientsCount: studio._count.clients,
            status: studio._count.rooms > 0 ? 'ACTIVE' : 'PENDING_SETUP',
        };
    }
}
