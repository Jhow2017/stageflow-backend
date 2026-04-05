import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { MercadoPagoPlatformSubscriptionGateway } from '../../domain/subscription-checkout/application/services/mercadopago-platform-subscription-gateway';
import type {
    CreatePendingPreapprovalInput,
    CreateTransparentPaymentInput,
} from '../../domain/subscription-checkout/application/services/mercadopago-platform-subscription-types';
import {
    mercadoPagoApiBaseUrl,
    mercadoPagoApiVersion,
    mercadoPagoSubscriptionWebhookUrl,
    requireMercadoPagoEnv,
} from './mercado-pago-env';

function frontendBaseUrl(): string {
    return requireMercadoPagoEnv('FRONTEND_URL').replace(/\/$/, '');
}

@Injectable()
export class MercadoPagoPlatformSubscriptionGatewayService extends MercadoPagoPlatformSubscriptionGateway {
    private accessToken(): string {
        return requireMercadoPagoEnv('MERCADOPAGO_ACCESS_TOKEN');
    }

    private async mpFetch<T>(path: string, init: RequestInit): Promise<T> {
        const base = mercadoPagoApiBaseUrl();
        const version = mercadoPagoApiVersion();
        const res = await fetch(`${base}/${version}${path}`, {
            ...init,
            headers: {
                Authorization: `Bearer ${this.accessToken()}`,
                'Content-Type': 'application/json',
                ...init.headers,
            },
        });
        const text = await res.text();
        const json = text ? (JSON.parse(text) as T) : ({} as T);
        if (!res.ok) {
            const err = json as { message?: string };
            throw new Error(
                `Mercado Pago API error ${res.status}: ${err.message ?? text ?? 'unknown'}`,
            );
        }
        return json;
    }

    async createPendingPreapproval(input: CreatePendingPreapprovalInput): Promise<{ id: string }> {
        const isAnnual = input.billingCycle === 'ANNUAL';
        const body = {
            reason: input.planLabel,
            external_reference: `subscription-checkout-${input.checkoutId}`,
            payer_email: input.ownerEmail,
            auto_recurring: {
                frequency: isAnnual ? 12 : 1,
                frequency_type: 'months',
                transaction_amount: input.amountReaisPerCycle,
                currency_id: 'BRL',
            },
            back_url: `${frontendBaseUrl()}/signup/sucesso`,
            status: 'pending',
            notification_url: mercadoPagoSubscriptionWebhookUrl(),
        };

        const res = await this.mpFetch<{ id?: string }>('/preapproval', {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'X-Idempotency-Key': randomUUID(),
            },
        });
        if (!res.id) {
            throw new Error('Mercado Pago preapproval did not return id');
        }
        return { id: res.id };
    }

    async attachCardToPreapproval(preapprovalId: string, cardTokenId: string): Promise<unknown> {
        return this.mpFetch(`/preapproval/${preapprovalId}`, {
            method: 'PUT',
            body: JSON.stringify({ card_token_id: cardTokenId }),
            headers: {
                'X-Idempotency-Key': randomUUID(),
            },
        });
    }

    async createTransparentPayment(input: CreateTransparentPaymentInput): Promise<Record<string, unknown>> {
        const body: Record<string, unknown> = {
            transaction_amount: input.amountReais,
            description: input.description,
            payment_method_id: input.paymentMethodId,
            external_reference: `subscription-checkout-${input.checkoutId}`,
            notification_url: mercadoPagoSubscriptionWebhookUrl(),
            payer: {
                email: input.ownerEmail,
                identification: {
                    type: input.payerIdentificationType,
                    number: input.payerIdentificationNumber.replace(/\D/g, ''),
                },
            },
        };

        if (input.token) {
            body.token = input.token;
            body.installments = input.installments ?? 1;
            if (input.issuerId) {
                body.issuer_id = input.issuerId;
            }
        }

        return this.mpFetch<Record<string, unknown>>('/payments', {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'X-Idempotency-Key': randomUUID(),
            },
        });
    }

    async getPayment(paymentId: string): Promise<Record<string, unknown>> {
        return this.mpFetch<Record<string, unknown>>(`/payments/${paymentId}`, { method: 'GET' });
    }

    async getPreapproval(preapprovalId: string): Promise<Record<string, unknown>> {
        return this.mpFetch<Record<string, unknown>>(`/preapproval/${preapprovalId}`, { method: 'GET' });
    }
}
