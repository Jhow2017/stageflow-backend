import { Injectable } from '@nestjs/common';
import {
    MercadoPagoBookingCustomerPaymentGateway,
    MercadoPagoBookingCustomerPaymentParams,
} from '../../domain/booking/application/services/mercado-pago-booking-customer-payment-gateway';
import { MercadoPagoBookingPaymentService } from './mercado-pago-booking-payment.service';
import { MercadoPagoOwnerCredentialsService } from './mercado-pago-owner-credentials.service';

@Injectable()
export class MercadoPagoBookingCustomerPaymentGatewayService extends MercadoPagoBookingCustomerPaymentGateway {
    constructor(
        private readonly ownerCredentials: MercadoPagoOwnerCredentialsService,
        private readonly bookingPayment: MercadoPagoBookingPaymentService,
    ) {
        super();
    }

    async createPayment(params: MercadoPagoBookingCustomerPaymentParams): Promise<Record<string, unknown>> {
        const sellerAccessToken = await this.ownerCredentials.getValidAccessTokenForUser(params.studioOwnerUserId);
        return this.bookingPayment.createPayment({
            sellerAccessToken,
            bookingId: params.bookingId,
            amountReais: params.amountReais,
            description: params.description,
            payerEmail: params.payerEmail,
            paymentMethodId: params.paymentMethodId,
            payerIdentificationType: params.payerIdentificationType,
            payerIdentificationNumber: params.payerIdentificationNumber,
            token: params.token,
            installments: params.installments,
            issuerId: params.issuerId,
            applicationFeeReais: params.applicationFeeReais,
        });
    }
}
