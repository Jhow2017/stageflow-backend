import { Inject } from '@nestjs/common';
import { UseCaseError } from '../../../../core/errors/use-case-error';
import { BookingPaymentGateway } from '../services/booking-payment-gateway';
import { BookingsRepository } from '../repositories/bookings-repository';

export interface CreateBookingPaymentIntentRequest {
    bookingId: string;
}

export interface CreateBookingPaymentIntentResponse {
    paymentIntentId: string;
    clientSecret: string;
}

export class BookingNotFoundForPaymentError extends UseCaseError {
    constructor() {
        super('Booking not found for payment');
    }
}

export class CreateBookingPaymentIntentUseCase {
    constructor(
        @Inject(BookingsRepository)
        private bookingsRepository: BookingsRepository,
        @Inject(BookingPaymentGateway)
        private bookingPaymentGateway: BookingPaymentGateway,
    ) { }

    async execute({ bookingId }: CreateBookingPaymentIntentRequest): Promise<CreateBookingPaymentIntentResponse> {
        const booking = await this.bookingsRepository.findById(bookingId);
        if (!booking) throw new BookingNotFoundForPaymentError();

        const result = await this.bookingPaymentGateway.createPaymentIntent({
            bookingId: booking.id.toString(),
            amountInCents: Math.round(booking.totalPrice * 100),
            currency: 'brl',
            metadata: {
                bookingId: booking.id.toString(),
                studioId: booking.studioId,
            },
        });

        return result;
    }
}
