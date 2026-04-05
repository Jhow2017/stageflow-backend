import { Inject } from '@nestjs/common';
import { UseCaseError } from '../../../../core/errors/use-case-error';
import { UsersRepository } from '../../../auth/application/repositories/users-repository';
import { BookingPaymentGateway } from '../services/booking-payment-gateway';
import { BookingsRepository } from '../repositories/bookings-repository';
import { StudiosRepository } from '../repositories/studios-repository';

export interface CreateBookingPaymentIntentRequest {
    studioSlug: string;
    bookingId: string;
}

export type CreateBookingPaymentIntentResponse =
    | {
        provider: 'stripe';
        paymentIntentId: string;
        clientSecret: string;
    }
    | {
        provider: 'mercadopago';
        publicKey: string;
        amountReais: number;
        bookingId: string;
        studioSlug: string;
    };

export class BookingNotFoundForPaymentError extends UseCaseError {
    constructor() {
        super('Booking not found for payment');
    }
}

export class StudioMercadoPagoSellerNotConfiguredError extends UseCaseError {
    constructor() {
        super('Studio owner has not connected Mercado Pago (OAuth or manual credentials)');
    }
}

export class CreateBookingPaymentIntentUseCase {
    constructor(
        @Inject(BookingsRepository)
        private bookingsRepository: BookingsRepository,
        @Inject(StudiosRepository)
        private studiosRepository: StudiosRepository,
        @Inject(UsersRepository)
        private usersRepository: UsersRepository,
        @Inject(BookingPaymentGateway)
        private bookingPaymentGateway: BookingPaymentGateway,
    ) { }

    async execute({ studioSlug, bookingId }: CreateBookingPaymentIntentRequest): Promise<CreateBookingPaymentIntentResponse> {
        const studio = await this.studiosRepository.findBySlug(studioSlug);
        if (!studio) throw new BookingNotFoundForPaymentError();

        const booking = await this.bookingsRepository.findById(bookingId);
        if (!booking) throw new BookingNotFoundForPaymentError();
        if (booking.studioId !== studio.id.toString()) throw new BookingNotFoundForPaymentError();
        if (booking.paymentStatus === 'PAID') throw new BookingNotFoundForPaymentError();

        if (studio.payoutProvider === 'MERCADOPAGO') {
            if (!studio.ownerUserId) {
                throw new StudioMercadoPagoSellerNotConfiguredError();
            }
            const owner = await this.usersRepository.findById(studio.ownerUserId);
            if (!owner?.mercadoPagoAccessToken || !owner.mercadoPagoPublicKey) {
                throw new StudioMercadoPagoSellerNotConfiguredError();
            }
            return {
                provider: 'mercadopago',
                publicKey: owner.mercadoPagoPublicKey,
                amountReais: booking.totalPrice,
                bookingId: booking.id.toString(),
                studioSlug: studio.slug,
            };
        }

        if (!studio.stripeConnectedAccountId || !studio.stripeChargesEnabled || !studio.stripePayoutsEnabled) {
            throw new BookingNotFoundForPaymentError();
        }

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

        return {
            provider: 'stripe',
            paymentIntentId: result.paymentIntentId,
            clientSecret: result.clientSecret,
        };
    }
}
