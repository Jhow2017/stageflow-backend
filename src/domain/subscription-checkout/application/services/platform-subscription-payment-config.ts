import type { PlatformPaymentProvider } from '../../enterprise/entities/subscription-checkout-session';

export abstract class PlatformSubscriptionPaymentConfig {
    abstract getProvider(): PlatformPaymentProvider;
}
