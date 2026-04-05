import { Inject } from '@nestjs/common';
import { BookingsRepository } from '../repositories/bookings-repository';
import { StudiosRepository } from '../repositories/studios-repository';
import { UsersRepository } from '../../../auth/application/repositories/users-repository';
import { StudioNotFoundError } from './create-public-booking';
import {
    BookingNotFoundForPaymentError,
    StudioMercadoPagoSellerNotConfiguredError,
} from './create-booking-payment-intent';
import { MercadoPagoBookingCustomerPaymentGateway } from '../services/mercado-pago-booking-customer-payment-gateway';
import { MercadoPagoBookingApplicationFeeConfig } from '../services/mercado-pago-booking-application-fee-config';
import { UseCaseError } from '../../../../core/errors/use-case-error';

export class BookingPayoutProviderNotMercadoPagoError extends UseCaseError {
    constructor() {
        super('This studio receives payouts via Stripe; use the Stripe payment intent flow');
    }
}

export interface CreateBookingMercadoPagoPaymentRequest {
    studioSlug: string;
    bookingId: string;
    payerEmail: string;
    paymentMethodId: string;
    payerIdentificationType: string;
    payerIdentificationNumber: string;
    token?: string;
    installments?: number;
    issuerId?: string;
}

export interface CreateBookingMercadoPagoPaymentResponse {
    mercadoPagoPaymentId: string;
    status: string;
    raw: Record<string, unknown>;
}

function getString(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

export class CreateBookingMercadoPagoPaymentUseCase {
    constructor(
        @Inject(BookingsRepository)
        private bookingsRepository: BookingsRepository,
        @Inject(StudiosRepository)
        private studiosRepository: StudiosRepository,
        @Inject(UsersRepository)
        private usersRepository: UsersRepository,
        @Inject(MercadoPagoBookingCustomerPaymentGateway)
        private mercadoPagoGateway: MercadoPagoBookingCustomerPaymentGateway,
        @Inject(MercadoPagoBookingApplicationFeeConfig)
        private feeConfig: MercadoPagoBookingApplicationFeeConfig,
    ) { }

    async execute(req: CreateBookingMercadoPagoPaymentRequest): Promise<CreateBookingMercadoPagoPaymentResponse> {
        const studio = await this.studiosRepository.findBySlug(req.studioSlug);
        if (!studio) {
            throw new StudioNotFoundError();
        }
        if (studio.payoutProvider !== 'MERCADOPAGO') {
            throw new BookingPayoutProviderNotMercadoPagoError();
        }
        if (!studio.ownerUserId) {
            throw new StudioMercadoPagoSellerNotConfiguredError();
        }

        const owner = await this.usersRepository.findById(studio.ownerUserId);
        if (!owner?.mercadoPagoAccessToken || !owner.mercadoPagoPublicKey) {
            throw new StudioMercadoPagoSellerNotConfiguredError();
        }

        const booking = await this.bookingsRepository.findById(req.bookingId);
        if (!booking || booking.studioId !== studio.id.toString()) {
            throw new BookingNotFoundForPaymentError();
        }
        if (booking.paymentStatus === 'PAID') {
            throw new BookingNotFoundForPaymentError();
        }

        const amountReais = booking.totalPrice;
        const description = `Reserva — estúdio ${studio.name}`;

        const feePercent = this.feeConfig.getPercent();
        let applicationFeeReais: number | undefined;
        if (owner.mercadoPagoConnectionType === 'OAUTH' && feePercent > 0) {
            applicationFeeReais = Math.round(amountReais * (feePercent / 100) * 100) / 100;
        }

        const payment = await this.mercadoPagoGateway.createPayment({
            studioOwnerUserId: studio.ownerUserId,
            bookingId: booking.id.toString(),
            amountReais,
            description,
            payerEmail: req.payerEmail.trim(),
            paymentMethodId: req.paymentMethodId.trim(),
            payerIdentificationType: req.payerIdentificationType.trim(),
            payerIdentificationNumber: req.payerIdentificationNumber.trim(),
            token: req.token?.trim(),
            installments: req.installments,
            issuerId: req.issuerId?.trim(),
            applicationFeeReais,
        });

        const idRaw = payment.id;
        const mercadoPagoPaymentId = idRaw !== undefined ? String(idRaw) : '';
        if (!mercadoPagoPaymentId) {
            throw new Error('Mercado Pago payment response missing id');
        }

        booking.assignMercadoPagoPaymentId(mercadoPagoPaymentId);
        await this.bookingsRepository.save(booking);

        const status = getString(payment.status) ?? 'unknown';

        return {
            mercadoPagoPaymentId,
            status,
            raw: payment,
        };
    }
}
