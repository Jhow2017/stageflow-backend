import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ListPublicRoomsUseCase } from '../../../domain/booking/application/use-cases/list-public-rooms';
import { Public } from '../../auth/public';

@ApiTags('Public Booking')
@Controller('/public/studios/:studioSlug/rooms')
export class ListPublicRoomsController {
    constructor(private listPublicRoomsUseCase: ListPublicRoomsUseCase) { }

    @Get()
    @Public()
    @ApiOperation({ summary: 'Listar salas públicas por studioSlug' })
    @ApiParam({ name: 'studioSlug', example: 'studio-beat-lab' })
    @ApiResponse({ status: 200, description: 'Lista de salas públicas' })
    @ApiResponse({ status: 404, description: 'Studio não encontrado' })
    async handle(@Param('studioSlug') studioSlug: string) {
        const { rooms } = await this.listPublicRoomsUseCase.execute({ studioSlug });

        return {
            rooms: rooms.map((room) => ({
                id: room.id.toString(),
                studioId: room.studioId,
                name: room.name,
                type: room.type,
                description: room.description,
                pricePerHour: room.pricePerHour,
                capacity: room.capacity,
                features: room.features,
                imageUrl: room.imageUrl,
                rating: room.rating,
                reviewCount: room.reviewCount,
            })),
        };
    }
}
