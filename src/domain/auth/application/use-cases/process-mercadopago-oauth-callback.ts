import { Inject } from '@nestjs/common';
import { UseCaseError } from '../../../../core/errors/use-case-error';
import { UsersRepository } from '../repositories/users-repository';
import {
    MercadoPagoOAuthPkceStatePort,
    MercadoPagoOAuthTokenExchangePort,
} from '../ports/mercadopago-oauth.ports';

export class MercadoPagoOAuthCallbackInvalidError extends UseCaseError {
    constructor() {
        super('Invalid or expired Mercado Pago OAuth state');
    }
}

export interface ProcessMercadoPagoOauthCallbackRequest {
    code: string;
    state: string;
}

export class ProcessMercadoPagoOauthCallbackUseCase {
    constructor(
        @Inject(MercadoPagoOAuthPkceStatePort)
        private pkceStatePort: MercadoPagoOAuthPkceStatePort,
        @Inject(MercadoPagoOAuthTokenExchangePort)
        private tokenExchangePort: MercadoPagoOAuthTokenExchangePort,
        @Inject(UsersRepository)
        private usersRepository: UsersRepository,
    ) { }

    async execute({ code, state }: ProcessMercadoPagoOauthCallbackRequest): Promise<{ ok: true }> {
        const verifier = this.pkceStatePort.consumeVerifier(state);
        if (!verifier) {
            throw new MercadoPagoOAuthCallbackInvalidError();
        }

        const tokens = await this.tokenExchangePort.exchangeAuthorizationCode(code, verifier);
        const userId = state.split(':')[0];
        const user = await this.usersRepository.findById(userId);
        if (!user) {
            throw new MercadoPagoOAuthCallbackInvalidError();
        }

        const expiresIn = tokens.expiresInSeconds ?? 15_552_000;
        const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);

        user.setMercadoPagoOAuthCredentials({
            accessToken: tokens.accessToken,
            publicKey: tokens.publicKey ?? '',
            refreshToken: tokens.refreshToken ?? '',
            userId: tokens.userId !== undefined ? String(tokens.userId) : '',
            tokenExpiresAt,
        });

        await this.usersRepository.save(user);

        return { ok: true };
    }
}
