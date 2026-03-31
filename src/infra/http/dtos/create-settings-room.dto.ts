import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateSettingsRoomDto {
    @ApiProperty({ example: 'Sala A - Ensaio' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'rehearsal' })
    @IsString()
    @IsNotEmpty()
    type: string;

    @ApiProperty({ example: 'Ideal para bandas e ensaios com bateria e amplificadores.' })
    @IsString()
    @IsNotEmpty()
    description: string;

    @ApiProperty({ example: 80 })
    @Type(() => Number)
    @IsNumber()
    @Min(0.01)
    pricePerHour: number;

    @ApiProperty({ example: 6 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    capacity: number;

    @ApiProperty({ example: ['Bateria acústica', 'PA 1000W'] })
    @IsArray()
    @IsString({ each: true })
    features: string[];

    @ApiPropertyOptional({ example: 'https://cdn.example.com/room-a.png' })
    @IsOptional()
    @IsString()
    imageUrl?: string;

    @ApiPropertyOptional({ example: 4.9 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    @Max(5)
    rating?: number;

    @ApiPropertyOptional({ example: 124 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(0)
    reviewCount?: number;
}
