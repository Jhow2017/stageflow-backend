import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import {
    CreateStripeConnectOnboardingLinkRequest,
    CreateStripeConnectOnboardingLinkResponse,
    StripeConnectedAccountSnapshot,
    StripeConnectGateway,
} from '../../domain/booking/application/services/stripe-connect-gateway';

function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

@Injectable()
export class StripeConnectGatewayService implements StripeConnectGateway {
    private readonly stripe: Stripe;

    constructor() {
        this.stripe = new Stripe(requireEnv('STRIPE_SECRET_KEY'));
    }

    async createOnboardingLink(
        data: CreateStripeConnectOnboardingLinkRequest,
    ): Promise<CreateStripeConnectOnboardingLinkResponse> {
        let accountId = data.accountId ?? null;

        if (!accountId) {
            const account = await this.stripe.accounts.create({
                type: 'express',
                email: data.email,
                business_profile: {
                    name: data.businessName,
                },
                metadata: data.metadata,
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
            });
            accountId = account.id;
        }

        const accountLink = await this.stripe.accountLinks.create({
            account: accountId,
            refresh_url: `${requireEnv('FRONTEND_URL')}/financeiro/stripe/refresh?account=${accountId}`,
            return_url: `${requireEnv('FRONTEND_URL')}/financeiro/stripe/return?account=${accountId}`,
            type: 'account_onboarding',
        });

        return {
            accountId,
            onboardingUrl: accountLink.url,
        };
    }

    async createDashboardLoginLink(accountId: string): Promise<string> {
        const link = await this.stripe.accounts.createLoginLink(accountId);
        return link.url;
    }

    async retrieveAccountSnapshot(accountId: string): Promise<StripeConnectedAccountSnapshot> {
        const account = await this.stripe.accounts.retrieve(accountId);
        const currentlyDue = account.requirements?.currently_due ?? [];
        const eventuallyDue = account.requirements?.eventually_due ?? [];

        const status: 'PENDING' | 'RESTRICTED' | 'ACTIVE' =
            account.charges_enabled && account.payouts_enabled
                ? 'ACTIVE'
                : currentlyDue.length > 0
                    ? 'RESTRICTED'
                    : 'PENDING';

        return {
            accountId: account.id,
            chargesEnabled: !!account.charges_enabled,
            payoutsEnabled: !!account.payouts_enabled,
            detailsSubmitted: !!account.details_submitted,
            requirementsCurrentlyDue: currentlyDue,
            requirementsEventuallyDue: eventuallyDue,
            connectStatus: status,
        };
    }
}
