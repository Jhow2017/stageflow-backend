import type { CreatePendingPreapprovalInput, CreateTransparentPaymentInput } from './mercadopago-platform-subscription-types';

export abstract class MercadoPagoPlatformSubscriptionGateway {
    abstract createPendingPreapproval(input: CreatePendingPreapprovalInput): Promise<{ id: string }>;
    abstract attachCardToPreapproval(preapprovalId: string, cardTokenId: string): Promise<unknown>;
    abstract createTransparentPayment(input: CreateTransparentPaymentInput): Promise<Record<string, unknown>>;
    abstract getPayment(paymentId: string): Promise<Record<string, unknown>>;
    abstract getPreapproval(preapprovalId: string): Promise<Record<string, unknown>>;
}
