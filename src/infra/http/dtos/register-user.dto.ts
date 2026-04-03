import { IsString, MinLength, IsNotEmpty, IsOptional, Matches, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { AuthBaseDto } from './auth-base.dto';

export class RegisterUserDto extends AuthBaseDto {
    @ApiProperty({
        description: 'Nome completo do usuário',
        example: 'João Silva',
    })
    @IsNotEmpty({ message: 'Name is required' })
    @IsString({ message: 'Name must be a string' })
    name: string;

    @ApiProperty({
        description: 'Senha do usuário (mínimo 6 caracteres)',
        example: 'senha123',
        minLength: 6,
    })
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password: string;

    @ApiPropertyOptional({ description: 'Telefone / WhatsApp' })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiPropertyOptional({ description: 'CPF ou CNPJ (somente dígitos após normalização)' })
    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? value.replace(/\D/g, '') : value))
    @ValidateIf((_, v) => v !== undefined && v !== null && v !== '')
    @Matches(/^\d{11}$|^\d{14}$/, {
        message: 'document must be a valid CPF (11 digits) or CNPJ (14 digits)',
    })
    document?: string;

    @ApiPropertyOptional({ description: 'Nome do estúdio (pré-cadastro)' })
    @IsOptional()
    @IsString()
    studioName?: string;

    @ApiPropertyOptional({ description: 'Slug do subdomínio desejado (min. 3)' })
    @IsOptional()
    @IsString()
    @ValidateIf((_, v) => v !== undefined && v !== null && v !== '')
    @MinLength(3, { message: 'studioSlug must be at least 3 characters' })
    @Matches(/^[a-z]+(?:-[a-z]+)*$/, {
        message: 'studioSlug must be lowercase letters separated by single hyphens',
    })
    studioSlug?: string;
}