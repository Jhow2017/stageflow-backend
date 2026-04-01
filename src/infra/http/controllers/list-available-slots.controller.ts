import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ListAvailableSlotsByDateUseCase } from '../../../domain/booking/application/use-cases/list-available-slots-by-date';
import { ListAvailableSlotsByRangeUseCase } from '../../../domain/booking/application/use-cases/list-available-slots-by-range';
import { Public } from '../../auth/public';
import { ListAvailableSlotsDto } from '../dtos/list-available-slots.dto';
import { ListAvailableSlotsRangeDto } from '../dtos/list-available-slots-range.dto';

@ApiTags('Public Booking')
@Controller('/public/studios/:studioSlug/rooms/:roomId/availability')
export class ListAvailableSlotsController {
    constructor(
        private listAvailableSlotsByDateUseCase: ListAvailableSlotsByDateUseCase,
        private listAvailableSlotsByRangeUseCase: ListAvailableSlotsByRangeUseCase,
    ) { }

    @Get()
    @Public()
    @ApiOperation({ summary: 'Listar horários disponíveis por sala e data' })
    @ApiParam({ name: 'studioSlug', example: 'studio-beat-lab' })
    @ApiParam({ name: 'roomId', example: 'uuid-da-sala' })
    @ApiQuery({ name: 'year', example: 2026 })
    @ApiQuery({ name: 'month', example: 4 })
    @ApiQuery({ name: 'day', example: 1 })
    @ApiResponse({ status: 200, description: 'Horários disponíveis' })
    @ApiResponse({ status: 400, description: 'Data inválida ou data passada' })
    @ApiResponse({ status: 404, description: 'Studio ou sala não encontrado' })
    async handle(
        @Param('studioSlug') studioSlug: string,
        @Param('roomId') roomId: string,
        @Query() query: ListAvailableSlotsDto,
    ) {
        const { availableSlots } = await this.listAvailableSlotsByDateUseCase.execute({
            studioSlug,
            roomId,
            year: query.year,
            month: query.month,
            day: query.day,
        });

        return {
            availableSlots,
        };
    }

    @Get('/range')
    @Public()
    @ApiOperation({ summary: 'Listar horários disponíveis por sala em um intervalo de datas' })
    @ApiParam({ name: 'studioSlug', example: 'studio-beat-lab' })
    @ApiParam({ name: 'roomId', example: 'uuid-da-sala' })
    @ApiQuery({ name: 'startDate', example: '2026-04-01' })
    @ApiQuery({ name: 'endDate', example: '2026-04-07' })
    @ApiResponse({ status: 200, description: 'Disponibilidade por data' })
    @ApiResponse({ status: 400, description: 'Intervalo inválido ou data passada' })
    @ApiResponse({ status: 404, description: 'Studio ou sala não encontrado' })
    async handleRange(
        @Param('studioSlug') studioSlug: string,
        @Param('roomId') roomId: string,
        @Query() query: ListAvailableSlotsRangeDto,
    ) {
        const { availabilityByDate } = await this.listAvailableSlotsByRangeUseCase.execute({
            studioSlug,
            roomId,
            startDate: query.startDate,
            endDate: query.endDate,
        });

        return {
            availabilityByDate,
        };
    }
}
