import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

/** Cadastro público (/auth/signup): contato + estúdio + documento. */
export class RegisterSubscriberDto {
    @ApiProperty({ example: 'joao@email.com' })
    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Email must be a valid email address' })
    email: string;

    @ApiProperty({ description: 'Senha (mínimo 6 caracteres)', example: 'senha123', minLength: 6 })
    @IsNotEmpty({ message: 'Password is required' })
    @IsString()
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password: string;

    @ApiProperty({ description: 'Nome completo', example: 'João Silva' })
    @IsNotEmpty({ message: 'Name is required' })
    @IsString()
    name: string;

    @ApiProperty({ description: 'Telefone / WhatsApp', example: '+5511999999999' })
    @IsNotEmpty({ message: 'phone is required' })
    @IsString()
    phone: string;

    @ApiProperty({ description: 'CPF ou CNPJ (com ou sem máscara)', example: '000.000.000-00' })
    @Transform(({ value }) => (typeof value === 'string' ? value.replace(/\D/g, '') : value))
    @IsString()
    @IsNotEmpty({ message: 'document is required' })
    @Matches(/^\d{11}$|^\d{14}$/, {
        message: 'document must be a valid CPF (11 digits) or CNPJ (14 digits)',
    })
    document: string;

    @ApiProperty({ description: 'Nome do estúdio', example: 'Rock Valley Studio' })
    @IsNotEmpty({ message: 'studioName is required' })
    @IsString()
    studioName: string;

    @ApiProperty({ description: 'Slug do subdomínio (min. 3, minúsculas e hífens)', example: 'rock-valley-studio' })
    @IsNotEmpty({ message: 'studioSlug is required' })
    @IsString()
    @MinLength(3, { message: 'studioSlug must be at least 3 characters' })
    @Matches(/^[a-z]+(?:-[a-z]+)*$/, {
        message: 'studioSlug must be lowercase letters separated by single hyphens (e.g. rock-valley-studio)',
    })
    studioSlug: string;
}
