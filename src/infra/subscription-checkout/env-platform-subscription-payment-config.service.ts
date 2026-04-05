import { Injectable } from '@nestjs/common';
import { PlatformSubscriptionPaymentConfig } from '../../domain/subscription-checkout/application/services/platform-subscription-payment-config';
import type { PlatformPaymentProvider } from '../../domain/subscription-checkout/enterprise/entities/subscription-checkout-session';

@Injectable()
export class EnvPlatformSubscriptionPaymentConfigService extends PlatformSubscriptionPaymentConfig {
    getProvider(): PlatformPaymentProvider {
        const raw = (process.env.PLATFORM_SUBSCRIPTION_PROVIDER ?? 'mercadopago').trim().toLowerCase();
        return raw === 'stripe' ? 'STRIPE' : 'MERCADOPAGO';
    }
}
