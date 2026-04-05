import { Injectable } from '@nestjs/common';
import {
    MercadoPagoOAuthAuthorizationPort,
    MercadoPagoOAuthPkceStatePort,
    MercadoPagoOAuthTokenBundle,
    MercadoPagoOAuthTokenExchangePort,
} from '../../domain/auth/application/ports/mercadopago-oauth.ports';
import { MercadoPagoOauthService } from './mercado-pago-oauth.service';
import { MercadoPagoOauthStateStore } from './mercado-pago-oauth-state.store';

@Injectable()
export class MercadoPagoOAuthAuthorizationAdapter extends MercadoPagoOAuthAuthorizationPort {
    constructor(private readonly oauth: MercadoPagoOauthService) {
        super();
    }

    buildAuthorizationUrl(state: string, codeChallenge: string): string {
        return this.oauth.buildAuthorizationUrl(state, codeChallenge);
    }
}

@Injectable()
export class MercadoPagoOAuthPkceStateAdapter extends MercadoPagoOAuthPkceStatePort {
    constructor(private readonly store: MercadoPagoOauthStateStore) {
        super();
    }

    save(state: string, codeVerifier: string): void {
        this.store.set(state, codeVerifier);
    }

    consumeVerifier(state: string): string | null {
        return this.store.getVerifierAndDelete(state);
    }
}

@Injectable()
export class MercadoPagoOAuthTokenExchangeAdapter extends MercadoPagoOAuthTokenExchangePort {
    constructor(private readonly oauth: MercadoPagoOauthService) {
        super();
    }

    async exchangeAuthorizationCode(code: string, codeVerifier: string): Promise<MercadoPagoOAuthTokenBundle> {
        const res = await this.oauth.exchangeAuthorizationCode(code, codeVerifier);
        return {
            accessToken: res.access_token,
            refreshToken: res.refresh_token,
            publicKey: res.public_key,
            userId: res.user_id,
            expiresInSeconds: res.expires_in,
        };
    }
}
