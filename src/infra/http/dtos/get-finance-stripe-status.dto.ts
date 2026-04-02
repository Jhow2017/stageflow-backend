import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetFinanceStripeStatusDto {
    @ApiPropertyOptional({ example: true, description: 'Atualiza status em tempo real no Stripe antes de responder' })
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    refresh?: boolean;
}
