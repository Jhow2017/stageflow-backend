export function requireMercadoPagoEnv(name: string): string {
    const value = process.env[name];
    if (!value?.trim()) {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value.trim();
}

export function mercadoPagoApiBaseUrl(): string {
    return (process.env.MERCADOPAGO_API_URL ?? 'https://api.mercadopago.com').replace(/\/$/, '');
}

export function mercadoPagoApiVersion(): string {
    return process.env.MERCADOPAGO_API_VERSION ?? 'v1';
}

export function backendPublicUrl(): string {
    return requireMercadoPagoEnv('BACKEND_URL').replace(/\/$/, '');
}

export function mercadoPagoSubscriptionWebhookUrl(): string {
    return `${backendPublicUrl()}/webhooks/mercadopago/subscription`;
}

export function mercadoPagoReservationWebhookUrl(): string {
    return `${backendPublicUrl()}/webhooks/reservations/mercadopago`;
}

export function mercadoPagoApplicationFeePercent(): number {
    const raw = process.env.MERCADOPAGO_BOOKING_APPLICATION_FEE_PERCENT;
    if (raw === undefined || raw === '') return 8;
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 && n <= 100 ? n : 8;
}
