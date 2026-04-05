import { Inject } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';
import { User } from '../../enterprise/entities/user';
import {
    MercadoPagoOAuthAuthorizationPort,
    MercadoPagoOAuthPkceStatePort,
} from '../ports/mercadopago-oauth.ports';

function base64Url(buf: Buffer): string {
    return buf
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/u, '');
}

export interface StartMercadoPagoOauthConnectRequest {
    user: User;
}

export interface StartMercadoPagoOauthConnectResponse {
    authorizationUrl: string;
    state: string;
}

export class StartMercadoPagoOauthConnectUseCase {
    constructor(
        @Inject(MercadoPagoOAuthAuthorizationPort)
        private authorizationPort: MercadoPagoOAuthAuthorizationPort,
        @Inject(MercadoPagoOAuthPkceStatePort)
        private pkceStatePort: MercadoPagoOAuthPkceStatePort,
    ) { }

    async execute({ user }: StartMercadoPagoOauthConnectRequest): Promise<StartMercadoPagoOauthConnectResponse> {
        const codeVerifier = base64Url(randomBytes(32));
        const codeChallenge = base64Url(createHash('sha256').update(codeVerifier).digest());
        const state = `${user.id.toString()}:${base64Url(randomBytes(16))}`;

        this.pkceStatePort.save(state, codeVerifier);

        const authorizationUrl = this.authorizationPort.buildAuthorizationUrl(state, codeChallenge);

        return { authorizationUrl, state };
    }
}
