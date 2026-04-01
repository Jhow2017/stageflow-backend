import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class ListAvailableSlotsRangeDto {
    @ApiProperty({ example: '2026-04-01', description: 'Data inicial (YYYY-MM-DD)' })
    @IsDateString()
    startDate: string;

    @ApiProperty({ example: '2026-04-07', description: 'Data final (YYYY-MM-DD)' })
    @IsDateString()
    endDate: string;
}
