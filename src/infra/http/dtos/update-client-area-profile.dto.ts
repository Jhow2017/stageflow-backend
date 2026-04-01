import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateClientAreaProfileDto {
    @ApiProperty({ example: 'Banda Supersonic' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'contato@supersonic.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: '11999998888' })
    @IsString()
    @IsNotEmpty()
    phone: string;

    @ApiPropertyOptional({ example: 'Preferencia por sala com bateria vintage' })
    @IsOptional()
    @IsString()
    notes?: string;
}
