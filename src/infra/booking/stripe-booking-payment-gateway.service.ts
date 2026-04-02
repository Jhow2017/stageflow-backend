import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import {
    BookingPaymentGateway,
    CreateBookingPaymentIntentRequest,
    CreateBookingPaymentIntentResponse,
} from '../../domain/booking/application/services/booking-payment-gateway';

function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

@Injectable()
export class StripeBookingPaymentGatewayService implements BookingPaymentGateway {
    private readonly stripe: Stripe;

    constructor() {
        this.stripe = new Stripe(requireEnv('STRIPE_SECRET_KEY'));
    }

    async createPaymentIntent(data: CreateBookingPaymentIntentRequest): Promise<CreateBookingPaymentIntentResponse> {
        const paymentIntent = await this.stripe.paymentIntents.create({
            amount: data.amountInCents,
            currency: data.currency,
            metadata: data.metadata,
            receipt_email: data.customerEmail,
            automatic_payment_methods: {
                enabled: true,
            },
        });

        if (!paymentIntent.client_secret) {
            throw new Error('Stripe payment intent did not return client_secret');
        }

        return {
            paymentIntentId: paymentIntent.id,
            clientSecret: paymentIntent.client_secret,
        };
    }
}
