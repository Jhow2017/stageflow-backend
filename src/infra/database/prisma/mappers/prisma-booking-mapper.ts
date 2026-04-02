import { Prisma } from '@prisma/client';
import { UniqueEntityID } from '../../../../core/entities/unique-entity-id';
import { Booking } from '../../../../domain/booking/enterprise/entities/booking';

type PrismaBooking = Prisma.BookingGetPayload<Record<string, never>>;

export class PrismaBookingMapper {
    static toDomain(raw: PrismaBooking): Booking {
        return Booking.create(
            {
                studioId: raw.studioId,
                roomId: raw.roomId,
                clientId: raw.clientId,
                bookingDate: raw.bookingDate,
                startHour: raw.startHour,
                endHour: raw.endHour,
                totalPrice: Number(raw.totalPrice),
                status: raw.status,
                paymentMethod: raw.paymentMethod,
                paymentStatus: raw.paymentStatus,
                paymentRef: raw.paymentRef,
            },
            new UniqueEntityID(raw.id),
        );
    }

    static toPrisma(booking: Booking): Prisma.BookingUncheckedCreateInput {
        return {
            id: booking.id.toString(),
            studioId: booking.studioId,
            roomId: booking.roomId,
            clientId: booking.clientId,
            bookingDate: booking.bookingDate,
            startHour: booking.startHour,
            endHour: booking.endHour,
            totalPrice: booking.totalPrice,
            status: booking.status,
            paymentMethod: booking.paymentMethod,
            paymentStatus: booking.paymentStatus,
            paymentRef: booking.paymentRef,
            createdAt: booking.createdAt,
        };
    }
}
