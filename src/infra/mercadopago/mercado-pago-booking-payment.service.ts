import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
    mercadoPagoApiBaseUrl,
    mercadoPagoApiVersion,
    mercadoPagoReservationWebhookUrl,
} from './mercado-pago-env';

export interface CreateBookingMercadoPagoPaymentInput {
    sellerAccessToken: string;
    bookingId: string;
    amountReais: number;
    description: string;
    payerEmail: string;
    paymentMethodId: string;
    payerIdentificationType: string;
    payerIdentificationNumber: string;
    token?: string;
    installments?: number;
    issuerId?: string;
    applicationFeeReais?: number;
}

@Injectable()
export class MercadoPagoBookingPaymentService {
    private async mpFetchWithToken<T>(accessToken: string, path: string, init: RequestInit): Promise<T> {
        const base = mercadoPagoApiBaseUrl();
        const version = mercadoPagoApiVersion();
        const res = await fetch(`${base}/${version}${path}`, {
            ...init,
            headers: {
                Authorization: `Bearer ${accessToken}`,
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

    async createPayment(input: CreateBookingMercadoPagoPaymentInput): Promise<Record<string, unknown>> {
        const body: Record<string, unknown> = {
            transaction_amount: input.amountReais,
            description: input.description,
            payment_method_id: input.paymentMethodId,
            external_reference: `booking-${input.bookingId}-${Date.now()}-${randomUUID().slice(0, 8)}`,
            notification_url: mercadoPagoReservationWebhookUrl(),
            payer: {
                email: input.payerEmail,
                identification: {
                    type: input.payerIdentificationType,
                    number: input.payerIdentificationNumber.replace(/\D/g, ''),
                },
            },
        };

        if (input.applicationFeeReais !== undefined && input.applicationFeeReais > 0) {
            body.application_fee = input.applicationFeeReais;
        }

        if (input.token) {
            body.token = input.token;
            body.installments = input.installments ?? 1;
            if (input.issuerId) {
                body.issuer_id = input.issuerId;
            }
        }

        return this.mpFetchWithToken<Record<string, unknown>>(input.sellerAccessToken, '/payments', {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'X-Idempotency-Key': randomUUID(),
            },
        });
    }

    async getPayment(accessToken: string, paymentId: string): Promise<Record<string, unknown>> {
        return this.mpFetchWithToken<Record<string, unknown>>(accessToken, `/payments/${paymentId}`, { method: 'GET' });
    }
}
