import { Injectable } from '@nestjs/common';
import { requireMercadoPagoEnv } from './mercado-pago-env';

export interface MercadoPagoTokenResponse {
    access_token: string;
    refresh_token?: string;
    public_key?: string;
    user_id?: number;
    expires_in?: number;
    live_mode?: boolean;
}

@Injectable()
export class MercadoPagoOauthService {
    buildAuthorizationUrl(state: string, codeChallenge: string): string {
        const clientId = requireMercadoPagoEnv('MERCADOPAGO_CLIENT_ID');
        const redirectUri = requireMercadoPagoEnv('MERCADOPAGO_OAUTH_REDIRECT_URI');
        const params = new URLSearchParams({
            client_id: clientId,
            response_type: 'code',
            platform_id: 'mp',
            state,
            redirect_uri: redirectUri,
            code_challenge: codeChallenge,
            code_challenge_method: 'S256',
        });
        return `https://auth.mercadopago.com.br/authorization?${params.toString()}`;
    }

    async exchangeAuthorizationCode(code: string, codeVerifier: string): Promise<MercadoPagoTokenResponse> {
        const clientId = requireMercadoPagoEnv('MERCADOPAGO_CLIENT_ID');
        const clientSecret = requireMercadoPagoEnv('MERCADOPAGO_CLIENT_SECRET');
        const redirectUri = requireMercadoPagoEnv('MERCADOPAGO_OAUTH_REDIRECT_URI');

        const body = new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            code,
            grant_type: 'authorization_code',
            redirect_uri: redirectUri,
            code_verifier: codeVerifier,
        });

        const res = await fetch('https://api.mercadopago.com/oauth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body,
        });
        const text = await res.text();
        const json = text
            ? (JSON.parse(text) as MercadoPagoTokenResponse & { message?: string })
            : ({} as MercadoPagoTokenResponse & { message?: string });
        if (!res.ok) {
            throw new Error(`Mercado Pago OAuth token error ${res.status}: ${json.message ?? text}`);
        }
        return json as MercadoPagoTokenResponse;
    }

    async refreshAccessToken(refreshToken: string): Promise<MercadoPagoTokenResponse> {
        const clientId = requireMercadoPagoEnv('MERCADOPAGO_CLIENT_ID');
        const clientSecret = requireMercadoPagoEnv('MERCADOPAGO_CLIENT_SECRET');

        const body = new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
        });

        const res = await fetch('https://api.mercadopago.com/oauth/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body,
        });
        const text = await res.text();
        const json = text
            ? (JSON.parse(text) as MercadoPagoTokenResponse & { message?: string })
            : ({} as MercadoPagoTokenResponse & { message?: string });
        if (!res.ok) {
            throw new Error(`Mercado Pago OAuth refresh error ${res.status}: ${json.message ?? text}`);
        }
        return json as MercadoPagoTokenResponse;
    }
}
