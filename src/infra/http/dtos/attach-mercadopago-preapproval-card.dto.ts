import { IsString, MinLength } from 'class-validator';

export class AttachMercadoPagoPreapprovalCardDto {
    @IsString()
    @MinLength(1)
    cardTokenId!: string;
}
