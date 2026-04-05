import { SubscriptionCheckoutSession } from '../../enterprise/entities/subscription-checkout-session';

export abstract class SubscriptionCheckoutSessionsRepository {
    abstract create(session: SubscriptionCheckoutSession): Promise<void>;
    abstract findById(id: string): Promise<SubscriptionCheckoutSession | null>;
    abstract findByMercadoPagoPaymentId(mercadoPagoPaymentId: string): Promise<SubscriptionCheckoutSession | null>;
    abstract findByMercadoPagoPreapprovalId(mercadoPagoPreapprovalId: string): Promise<SubscriptionCheckoutSession | null>;
    abstract save(session: SubscriptionCheckoutSession): Promise<void>;
}
