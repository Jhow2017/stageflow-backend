import { Inject } from '@nestjs/common';
import { Encrypter } from '../cryptography/encrypter';
import { BlacklistedTokensRepository } from '../repositories/blacklisted-tokens-repository';

export interface LogoutClientAreaRequest {
    token: string;
}

export interface LogoutClientAreaResponse {
    message: string;
}

export class LogoutClientAreaUseCase {
    constructor(
        @Inject(BlacklistedTokensRepository)
        private blacklistedTokensRepository: BlacklistedTokensRepository,
        @Inject(Encrypter)
        private encrypter: Encrypter,
    ) { }

    async execute({ token }: LogoutClientAreaRequest): Promise<LogoutClientAreaResponse> {
        const payload = await this.encrypter.decrypt(token);
        const expiresAt = new Date((payload.exp as number) * 1000);

        await this.blacklistedTokensRepository.add(token, expiresAt);
        return { message: 'Logout da area do cliente realizado com sucesso' };
    }
}
