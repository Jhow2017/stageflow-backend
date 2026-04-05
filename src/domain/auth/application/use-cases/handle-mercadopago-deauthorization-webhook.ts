import { Inject } from '@nestjs/common';
import { UsersRepository } from '../repositories/users-repository';

export interface HandleMercadoPagoDeauthorizationWebhookRequest {
    mercadoPagoUserId: string;
}

export class HandleMercadoPagoDeauthorizationWebhookUseCase {
    constructor(
        @Inject(UsersRepository)
        private usersRepository: UsersRepository,
    ) { }

    async execute({ mercadoPagoUserId }: HandleMercadoPagoDeauthorizationWebhookRequest): Promise<{ ok: true }> {
        const user = await this.usersRepository.findByMercadoPagoUserId(mercadoPagoUserId);
        if (user) {
            user.clearMercadoPagoConnection();
            await this.usersRepository.save(user);
        }
        return { ok: true };
    }
}
