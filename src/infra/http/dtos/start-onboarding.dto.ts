import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, Min } from 'class-validator';
import { BillingCycle, DomainType, PaymentMethod, PlanTier } from '../../../domain/onboarding/enterprise/entities/onboarding-session';

export class StartOnboardingDto {
    @ApiProperty({ enum: ['STARTER', 'PROFESSIONAL', 'ENTERPRISE'] })
    @IsIn(['STARTER', 'PROFESSIONAL', 'ENTERPRISE'])
    planTier: PlanTier;

    @ApiProperty({ enum: ['MONTHLY', 'ANNUAL'] })
    @IsIn(['MONTHLY', 'ANNUAL'])
    billingCycle: BillingCycle;

    @ApiProperty({ example: 'Rock Valley Studio' })
    @IsString()
    @IsNotEmpty()
    studioName: string;

    @ApiProperty({ example: 'Carlos Mendes' })
    @IsString()
    @IsNotEmpty()
    ownerName: string;

    @ApiProperty({ example: 'contato@rockvalley.com.br' })
    @IsEmail()
    ownerEmail: string;

    @ApiProperty({ example: '(11) 99999-9999' })
    @IsString()
    @IsNotEmpty()
    ownerPhone: string;

    @ApiProperty({ example: '000.000.000-00' })
    @IsString()
    @IsNotEmpty()
    ownerDocument: string;

    @ApiProperty({ enum: ['SUBDOMAIN', 'CUSTOM_DOMAIN'] })
    @IsIn(['SUBDOMAIN', 'CUSTOM_DOMAIN'])
    domainType: DomainType;

    @ApiPropertyOptional({ example: 'seuestudio' })
    @IsOptional()
    @IsString()
    @Matches(/^[a-z0-9-]+$/)
    subdomain?: string;

    @ApiPropertyOptional({ example: 'www.seuestudio.com.br' })
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
