import { Inject } from '@nestjs/common';
import { User } from '../../enterprise/entities/user';
import { UsersRepository } from '../repositories/users-repository';

export interface SaveMercadoPagoManualCredentialsRequest {
    user: User;
    accessToken: string;
    publicKey: string;
}

export class SaveMercadoPagoManualCredentialsUseCase {
    constructor(
        @Inject(UsersRepository)
        private usersRepository: UsersRepository,
    ) { }

    async execute({ user, accessToken, publicKey }: SaveMercadoPagoManualCredentialsRequest): Promise<{ ok: true }> {
        user.setMercadoPagoManualCredentials(accessToken.trim(), publicKey.trim());
        await this.usersRepository.save(user);
        return { ok: true };
    }
}
