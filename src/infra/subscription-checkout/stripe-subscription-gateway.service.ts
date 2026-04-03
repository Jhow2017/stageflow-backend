import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import {
    CreateEmbeddedSubscriptionSessionRequest,
    CreateEmbeddedSubscriptionSessionResponse,
    StripeSubscriptionGateway,
    StripeWebhookEvent,
} from '../../domain/subscription-checkout/application/services/stripe-subscription-gateway';

function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

@Injectable()
export class StripeSubscriptionGatewayService implements StripeSubscriptionGateway {
    private readonly stripe: Stripe;

    constructor() {
        this.stripe = new Stripe(requireEnv('STRIPE_SECRET_KEY'));
    }

    private getPlanPriceId(planTier: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE', billingCycle: 'MONTHLY' | 'ANNUAL'): string {
        const key = `STRIPE_PRICE_${planTier}_${billingCycle}`;
        return requireEnv(key);
    }

    private getCustomDomainAddonPriceId(billingCycle: 'MONTHLY' | 'ANNUAL'): string {
        return requireEnv(`STRIPE_PRICE_CUSTOM_DOMAIN_${billingCycle}`);
    }

    async createEmbeddedSubscriptionSession(
        input: CreateEmbeddedSubscriptionSessionRequest,
    ): Promise<CreateEmbeddedSubscriptionSessionResponse> {
        const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
            {
                price: this.getPlanPriceId(input.planTier, input.billingCycle),
                quantity: 1,
            },
        ];

        if (input.domainType === 'CUSTOM_DOMAIN') {
            lineItems.push({
                price: this.getCustomDomainAddonPriceId(input.billingCycle),
                quantity: 1,
            });
        }

        const params = {
            mode: 'subscription',
            ui_mode: 'embedded_page',
            client_reference_id: input.checkoutId,
            return_url: `${requireEnv('FRONTEND_URL')}/signup/sucesso?session_id={CHECKOUT_SESSION_ID}`,
            customer_email: input.customerEmail,
            line_items: lineItems,
            payment_method_types: ['card'],
            metadata: input.metadata,
            subscription_data: {
                metadata: input.metadata,
                trial_period_days: 14,
            },
        } as unknown as Stripe.Checkout.SessionCreateParams;

        const session = await this.stripe.checkout.sessions.create(params);

        if (!session.client_secret) {
            throw new Error('Stripe checkout session did not return client_secret');
        }

        return {
            sessionId: session.id,
            clientSecret: session.client_secret,
            customerId: typeof session.customer === 'string' ? session.customer : null,
        };
    }

    constructEvent(payload: Buffer | string, signature: string): StripeWebhookEvent {
        const event = this.stripe.webhooks.constructEvent(
            payload,
            signature,
            requireEnv('STRIPE_WEBHOOK_SECRET'),
        );

        return {
            id: event.id,
            type: event.type,
            data: {
                object: event.data.object as unknown as Record<string, unknown>,
            },
        };
    }
}
