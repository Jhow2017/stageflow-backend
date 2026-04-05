import { IsString, MinLength } from 'class-validator';

export class MercadoPagoManualCredentialsDto {
    @IsString()
    @MinLength(16)
    accessToken!: string;

    @IsString()
    @MinLength(8)
    publicKey!: string;
}
