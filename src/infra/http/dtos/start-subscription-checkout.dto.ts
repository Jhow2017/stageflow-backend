import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { BillingCycle, DomainType, PaymentMethod, PlanTier } from '../../../domain/subscription-checkout/enterprise/entities/subscription-checkout-session';

export class StartSubscriptionCheckoutDto {
    @ApiProperty({ enum: ['STARTER', 'PROFESSIONAL', 'ENTERPRISE'] })
    @IsIn(['STARTER', 'PROFESSIONAL', 'ENTERPRISE'])
    planTier: PlanTier;

    @ApiProperty({ enum: ['MONTHLY', 'ANNUAL'] })
    @IsIn(['MONTHLY', 'ANNUAL'])
    billingCycle: BillingCycle;

    @ApiPropertyOptional({
        description:
            'Nome do estúdio. Se omitido, usa o valor salvo no perfil do usuário (cadastro).',
        example: 'Rock Valley Studio',
    })
    @IsOptional()
    @IsString()
    studioName?: string;

    @ApiProperty({
        enum: ['SUBDOMAIN', 'CUSTOM_DOMAIN'],
        description:
            'SUBDOMAIN = subdomínio gratuito na plataforma (passo "Configure seu domínio"). CUSTOM_DOMAIN = domínio próprio (add-on cobrado no Stripe; UI pode mostrar +valor em v2).',
    })
    @IsIn(['SUBDOMAIN', 'CUSTOM_DOMAIN'])
    domainType: DomainType;

    @ApiPropertyOptional({
        description:
            'Slug do subdomínio gratuito (ex.: seuestudio → seuestudio.sua-plataforma). Obrigatório na prática quando domainType é SUBDOMAIN: envie aqui ou use studioSlug já salvo no cadastro.',
        example: 'seuestudio',
    })
    @IsOptional()
    @IsString()
    subdomain?: string;

    @ApiPropertyOptional({
        description:
            'Domínio próprio quando domainType é CUSTOM_DOMAIN (ex.: www.seuestudio.com.br). Obrigatório nesse caso.',
        example: 'www.seuestudio.com.br',
    })
    @IsOptional()
    @IsString()
    customDomain?: string;

    @ApiProperty({ enum: ['CARD', 'PIX', 'BOLETO'] })
    @IsIn(['CARD', 'PIX', 'BOLETO'])
    paymentMethod: PaymentMethod;

    @ApiProperty({ example: 1970 })
    @IsNumber()
    @Min(0)
    totalAmount: number;
}
