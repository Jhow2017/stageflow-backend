import { Inject } from '@nestjs/common';
import { UseCaseError } from '../../../../core/errors/use-case-error';
import { BookingPaymentGateway } from '../services/booking-payment-gateway';
import { BookingsRepository } from '../repositories/bookings-repository';
import { StudiosRepository } from '../repositories/studios-repository';

export interface CreateBookingPaymentIntentRequest {
    studioSlug: string;
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
        @Inject(StudiosRepository)
        private studiosRepository: StudiosRepository,
        @Inject(BookingPaymentGateway)
        private bookingPaymentGateway: BookingPaymentGateway,
    ) { }

    async execute({ studioSlug, bookingId }: CreateBookingPaymentIntentRequest): Promise<CreateBookingPaymentIntentResponse> {
        const studio = await this.studiosRepository.findBySlug(studioSlug);
        if (!studio) throw new BookingNotFoundForPaymentError();

        if (!studio.stripeConnectedAccountId || !studio.stripeChargesEnabled || !studio.stripePayoutsEnabled) {
            throw new BookingNotFoundForPaymentError();
        }

        const booking = await this.bookingsRepository.findById(bookingId);
        if (!booking) throw new BookingNotFoundForPaymentError();
        if (booking.studioId !== studio.id.toString()) throw new BookingNotFoundForPaymentError();
        if (booking.paymentStatus === 'PAID') throw new BookingNotFoundForPaymentError();

        const result = await this.bookingPaymentGateway.createPaymentIntent({
            bookingId: booking.id.toString(),
            amountInCents: Math.round(booking.totalPrice * 100),
            currency: 'brl',
            destinationAccountId: studio.stripeConnectedAccountId,
            applicationFeeAmountInCents: Math.round(booking.totalPrice * 100 * 0.08),
            metadata: {
                bookingId: booking.id.toString(),
                studioId: booking.studioId,
            },
        });

        return result;
    }
}
