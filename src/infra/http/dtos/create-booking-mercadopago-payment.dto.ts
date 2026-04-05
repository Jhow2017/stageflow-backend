import { IsEmail, IsInt, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class CreateBookingMercadoPagoPaymentDto {
    @IsEmail()
    payerEmail!: string;

    @IsString()
    @MinLength(1)
    paymentMethodId!: string;

    @IsString()
    @MinLength(1)
    payerIdentificationType!: string;

    @IsString()
    @MinLength(1)
    payerIdentificationNumber!: string;

    @IsOptional()
    @IsString()
    token?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    installments?: number;

    @IsOptional()
    @IsString()
    issuerId?: string;
}
