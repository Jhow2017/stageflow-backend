import { IsString, MinLength } from 'class-validator';

export class MercadoPagoSubscriptionTransparentPaymentDto {
    @IsString()
    @MinLength(1)
    payerIdentificationType!: string;

    @IsString()
    @MinLength(1)
    payerIdentificationNumber!: string;
}
