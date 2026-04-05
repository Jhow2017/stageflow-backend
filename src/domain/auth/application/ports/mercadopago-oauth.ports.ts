export interface MercadoPagoOAuthTokenBundle {
    accessToken: string;
    refreshToken?: string;
    publicKey?: string;
    userId?: number;
    expiresInSeconds?: number;
}

export abstract class MercadoPagoOAuthAuthorizationPort {
    abstract buildAuthorizationUrl(state: string, codeChallenge: string): string;
}

export abstract class MercadoPagoOAuthPkceStatePort {
    abstract save(state: string, codeVerifier: string): void;
    abstract consumeVerifier(state: string): string | null;
}

export abstract class MercadoPagoOAuthTokenExchangePort {
    abstract exchangeAuthorizationCode(code: string, codeVerifier: string): Promise<MercadoPagoOAuthTokenBundle>;
}
