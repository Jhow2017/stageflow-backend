export interface CreateEmbeddedSubscriptionSessionRequest {
    checkoutId: string;
    customerEmail: string;
    customerName: string;
    planTier: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
    billingCycle: 'MONTHLY' | 'ANNUAL';
    domainType: 'SUBDOMAIN' | 'CUSTOM_DOMAIN';
    metadata: Record<string, string>;
}

export interface CreateEmbeddedSubscriptionSessionResponse {
    sessionId: string;
    clientSecret: string;
    customerId?: string | null;
}

export interface StripeWebhookEvent {
    id: string;
    type: string;
    data: {
        object: Record<string, unknown>;
    };
}

export abstract class StripeSubscriptionGateway {
    abstract createEmbeddedSubscriptionSession(
        input: CreateEmbeddedSubscriptionSessionRequest,
    ): Promise<CreateEmbeddedSubscriptionSessionResponse>;

    abstract constructEvent(payload: Buffer | string, signature: string): StripeWebhookEvent;
}
