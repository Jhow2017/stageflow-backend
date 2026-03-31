import { IsBoolean, IsEmail, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PublicPaymentMethodDto {
    PIX = 'PIX',
    CARD = 'CARD',
}

export class CreatePublicBookingDto {
    @ApiProperty({ example: 'uuid-da-sala' })
    @IsString()
    @IsNotEmpty()
    roomId: string;

    @ApiProperty({ example: 2026 })
    @Transform(({ value }) => Number(value))
    @IsInt()
    @Min(2000)
    year: number;

    @ApiProperty({ example: 4 })
    @Transform(({ value }) => Number(value))
    @IsInt()
    @Min(1)
    @Max(12)
    month: number;

    @ApiProperty({ example: 1 })
    @Transform(({ value }) => Number(value))
    @IsInt()
    @Min(1)
    @Max(31)
    day: number;

    @ApiProperty({ example: 8, description: 'Hora inicial (0-23)' })
    @Transform(({ value }) => Number(value))
    @IsInt()
    @Min(0)
    @Max(23)
    startHour: number;

    @ApiProperty({ example: 10, description: 'Hora final (1-24)' })
    @Transform(({ value }) => Number(value))
    @IsInt()
    @Min(1)
    @Max(24)
    endHour: number;

    @ApiProperty({ example: 'Jonathan Nascimento' })
    @IsString()
    @IsNotEmpty()
    customerName: string;

    @ApiProperty({ example: 'cliente@email.com' })
    @IsEmail()
    customerEmail: string;

    @ApiProperty({ example: '11999990000' })
    @IsString()
    @IsNotEmpty()
    customerPhone: string;

    @ApiPropertyOptional({ example: 'Levar mesa adicional' })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiPropertyOptional({ example: true, default: false })
    @IsOptional()
    @IsBoolean()
    createAccount?: boolean;

    @ApiPropertyOptional({ enum: PublicPaymentMethodDto, example: PublicPaymentMethodDto.PIX })
    @IsOptional()
    @IsEnum(PublicPaymentMethodDto)
    paymentMethod?: PublicPaymentMethodDto;
}
