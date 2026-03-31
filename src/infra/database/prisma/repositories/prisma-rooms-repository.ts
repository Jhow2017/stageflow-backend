import { Injectable } from '@nestjs/common';
import { Room } from '../../../../domain/booking/enterprise/entities/room';
import {
    CreateRoomRequest,
    FindAvailableSlotsRequest,
    RoomsRepository,
    UpdateRoomRequest,
} from '../../../../domain/booking/application/repositories/rooms-repository';
import { PrismaRoomMapper } from '../mappers/prisma-room-mapper';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PrismaRoomsRepository implements RoomsRepository {
    constructor(private prisma: PrismaService) { }

    async findById(roomId: string): Promise<Room | null> {
        const room = await this.prisma.room.findUnique({ where: { id: roomId } });

        if (!room) {
            return null;
        }

        return PrismaRoomMapper.toDomain(room);
    }

    async findByStudioId(studioId: string): Promise<Room[]> {
        const rooms = await this.prisma.room.findMany({
            where: { studioId, active: true },
            orderBy: { createdAt: 'asc' },
        });

        return rooms.map(PrismaRoomMapper.toDomain);
    }

    async findAvailableSlotsByDate({
        roomId,
        bookingDate,
        openHour,
        closeHour,
    }: FindAvailableSlotsRequest): Promise<number[]> {
        const bookings = await this.prisma.booking.findMany({
            where: {
                roomId,
                bookingDate,
                status: {
                    not: 'CANCELLED',
                },
            },
            select: {
                startHour: true,
                endHour: true,
            },
        });

        const takenSlots = new Set<number>();

        for (const booking of bookings) {
            for (let hour = booking.startHour; hour < booking.endHour; hour++) {
                takenSlots.add(hour);
            }
        }

        const availableSlots: number[] = [];

        for (let hour = openHour; hour < closeHour; hour++) {
            if (!takenSlots.has(hour)) {
                availableSlots.push(hour);
            }
        }

        return availableSlots;
    }

    async create(data: CreateRoomRequest): Promise<Room> {
        const room = await this.prisma.room.create({
            data: {
                studioId: data.studioId,
                name: data.name,
                type: data.type,
                description: data.description,
                pricePerHour: data.pricePerHour,
                capacity: data.capacity,
                features: data.features,
                imageUrl: data.imageUrl ?? null,
                rating: data.rating ?? null,
                reviewCount: data.reviewCount ?? null,
                active: data.active ?? true,
            },
        });

        return PrismaRoomMapper.toDomain(room);
    }

    async update(data: UpdateRoomRequest): Promise<Room> {
        const room = await this.prisma.room.update({
            where: { id: data.id },
            data: {
                studioId: data.studioId,
                name: data.name,
                type: data.type,
                description: data.description,
                pricePerHour: data.pricePerHour,
                capacity: data.capacity,
                features: data.features,
                imageUrl: data.imageUrl ?? null,
                rating: data.rating ?? null,
                reviewCount: data.reviewCount ?? null,
                active: data.active ?? true,
            },
        });

        return PrismaRoomMapper.toDomain(room);
    }
}
