export interface MercadoPagoBookingCustomerPaymentParams {
    studioOwnerUserId: string;
    bookingId: string;
    amountReais: number;
    description: string;
    payerEmail: string;
    paymentMethodId: string;
    payerIdentificationType: string;
    payerIdentificationNumber: string;
    token?: string;
    installments?: number;
    issuerId?: string;
    applicationFeeReais?: number;
}

export abstract class MercadoPagoBookingCustomerPaymentGateway {
    abstract createPayment(params: MercadoPagoBookingCustomerPaymentParams): Promise<Record<string, unknown>>;
}
