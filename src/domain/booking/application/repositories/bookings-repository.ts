import { Booking } from '../../enterprise/entities/booking';

export interface FindConflictRequest {
    roomId: string;
    bookingDate: Date;
    startHour: number;
    endHour: number;
}

export abstract class BookingsRepository {
    abstract create(booking: Booking): Promise<void>;
    abstract hasConflict(params: FindConflictRequest): Promise<boolean>;
    abstract findByStudioId(studioId: string): Promise<Booking[]>;
}
