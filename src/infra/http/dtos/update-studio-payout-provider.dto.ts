import { IsEnum } from 'class-validator';

export class UpdateStudioPayoutProviderDto {
    @IsEnum(['MERCADOPAGO', 'STRIPE'])
    payoutProvider!: 'MERCADOPAGO' | 'STRIPE';
}
