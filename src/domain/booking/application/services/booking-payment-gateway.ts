export interface CreateBookingPaymentIntentRequest {
    bookingId: string;
    amountInCents: number;
    currency: string;
    destinationAccountId: string;
    applicationFeeAmountInCents?: number;
    customerEmail?: string;
    metadata?: Record<string, string>;
}

export interface CreateBookingPaymentIntentResponse {
    paymentIntentId: string;
    clientSecret: string;
}

export abstract class BookingPaymentGateway {
    abstract createPaymentIntent(
        data: CreateBookingPaymentIntentRequest,
    ): Promise<CreateBookingPaymentIntentResponse>;
}
