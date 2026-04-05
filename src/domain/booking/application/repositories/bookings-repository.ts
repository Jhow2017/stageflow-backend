import { Booking } from '../../enterprise/entities/booking';

export interface FindConflictRequest {
    roomId: string;
    bookingDate: Date;
    startHour: number;
    endHour: number;
}

export abstract class BookingsRepository {
    abstract create(booking: Booking): Promise<void>;
    abstract save(booking: Booking): Promise<void>;
    abstract hasConflict(params: FindConflictRequest): Promise<boolean>;
    abstract findById(id: string): Promise<Booking | null>;
    abstract findByMercadoPagoPaymentId(mercadoPagoPaymentId: string): Promise<Booking | null>;
    abstract findByStudioId(studioId: string): Promise<Booking[]>;
    abstract findByStudioIdAndClientId(studioId: string, clientId: string): Promise<Booking[]>;
}
