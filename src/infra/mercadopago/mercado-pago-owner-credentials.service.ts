import { Injectable } from '@nestjs/common';
import { User } from '../../domain/auth/enterprise/entities/user';
import { UsersRepository } from '../../domain/auth/application/repositories/users-repository';
import { MercadoPagoOauthService } from './mercado-pago-oauth.service';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class MercadoPagoOwnerCredentialsService {
    constructor(
        private usersRepository: UsersRepository,
        private mercadoPagoOauthService: MercadoPagoOauthService,
    ) { }

    /** Retorna access token válido para chamadas em nome do vendedor (OAuth com refresh se necessário). */
    async getValidAccessTokenForUser(userId: string): Promise<string> {
        const user = await this.usersRepository.findById(userId);
        if (!user?.mercadoPagoAccessToken) {
            throw new Error('Mercado Pago not connected for this user');
        }

        if (
            user.mercadoPagoConnectionType === 'OAUTH'
            && user.mercadoPagoRefreshToken
            && user.mercadoPagoTokenExpiresAt
            && user.mercadoPagoTokenExpiresAt.getTime() - Date.now() < SEVEN_DAYS_MS
        ) {
            const refreshed = await this.mercadoPagoOauthService.refreshAccessToken(user.mercadoPagoRefreshToken);
            const expiresInSec = refreshed.expires_in ?? 15_552_000;
            const tokenExpiresAt = new Date(Date.now() + expiresInSec * 1000);
            user.updateMercadoPagoOAuthTokens({
                accessToken: refreshed.access_token,
                refreshToken: refreshed.refresh_token ?? user.mercadoPagoRefreshToken,
                tokenExpiresAt,
            });
            await this.usersRepository.save(user);
            return refreshed.access_token;
        }

        return user.mercadoPagoAccessToken;
    }

    async ensureUserHasPublicKey(user: User): Promise<string> {
        if (!user.mercadoPagoPublicKey) {
            throw new Error('Mercado Pago public key missing; reconnect or save credentials');
        }
        return user.mercadoPagoPublicKey;
    }
}
