import { Transform } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ListAvailableSlotsDto {
    @ApiProperty({ example: 2026, description: 'Ano da data desejada' })
    @Transform(({ value }) => Number(value))
    @IsInt()
    @Min(2000)
    year: number;

    @ApiProperty({ example: 4, description: 'Mês da data desejada (1-12)' })
    @Transform(({ value }) => Number(value))
    @IsInt()
    @Min(1)
    @Max(12)
    month: number;

    @ApiProperty({ example: 1, description: 'Dia da data desejada (1-31)' })
    @Transform(({ value }) => Number(value))
    @IsInt()
    @Min(1)
    @Max(31)
    day: number;
}
