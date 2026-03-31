export interface CreatePaymentIntentRequest {
    bookingId: string;
    amountInCents: number;
    currency: string;
    metadata?: Record<string, string>;
}

export interface CreatePaymentIntentResponse {
    providerPaymentId: string;
    clientSecret: string;
}

export interface PaymentWebhookEvent {
    providerPaymentId: string;
    status: 'PAID' | 'FAILED' | 'PENDING';
    rawPayload: Record<string, unknown>;
}

export abstract class PaymentGateway {
    abstract createPaymentIntent(
        data: CreatePaymentIntentRequest,
    ): Promise<CreatePaymentIntentResponse>;
    abstract handleWebhook(event: PaymentWebhookEvent): Promise<void>;
}
