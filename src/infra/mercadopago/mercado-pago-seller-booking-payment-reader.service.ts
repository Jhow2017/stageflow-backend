import { Injectable } from '@nestjs/common';
import { MercadoPagoSellerBookingPaymentReader } from '../../domain/booking/application/services/mercado-pago-seller-booking-payment-reader';
import { MercadoPagoBookingPaymentService } from './mercado-pago-booking-payment.service';
import { MercadoPagoOwnerCredentialsService } from './mercado-pago-owner-credentials.service';

@Injectable()
export class MercadoPagoSellerBookingPaymentReaderService extends MercadoPagoSellerBookingPaymentReader {
    constructor(
        private readonly ownerCredentials: MercadoPagoOwnerCredentialsService,
        private readonly bookingPayment: MercadoPagoBookingPaymentService,
    ) {
        super();
    }

    async getPayment(studioOwnerUserId: string, paymentId: string): Promise<Record<string, unknown>> {
        const accessToken = await this.ownerCredentials.getValidAccessTokenForUser(studioOwnerUserId);
        return this.bookingPayment.getPayment(accessToken, paymentId);
    }
}
