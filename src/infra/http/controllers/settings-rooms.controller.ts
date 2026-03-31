import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import { Req } from '@nestjs/common';
import { Request } from 'express';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateStudioRoomFromSettingsUseCase } from '../../../domain/booking/application/use-cases/create-studio-room-from-settings';
import { User } from '../../../domain/auth/enterprise/entities/user';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CreateSettingsRoomDto } from '../dtos/create-settings-room.dto';

@ApiTags('Settings')
@Controller('/settings/studios/:studioId/rooms')
@UseGuards(JwtAuthGuard)
export class SettingsRoomsController {
    constructor(
        private createStudioRoomFromSettingsUseCase: CreateStudioRoomFromSettingsUseCase,
    ) { }

    @Post()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Adicionar sala do studio (assinante USER vinculado ou OWNER)' })
    @ApiParam({ name: 'studioId', example: 'uuid-do-studio' })
    @ApiResponse({ status: 201, description: 'Sala criada com sucesso' })
    @ApiResponse({ status: 403, description: 'Acesso negado para este studio (sem vínculo)' })
    @ApiResponse({ status: 404, description: 'Studio não encontrado' })
    @ApiResponse({ status: 409, description: 'Limite de salas do plano atingido' })
    async create(
        @Param('studioId') studioId: string,
        @Req() req: Request,
        @Body() body: CreateSettingsRoomDto,
    ) {
        const user = req.user as User;
        const { room } = await this.createStudioRoomFromSettingsUseCase.execute({
            studioId,
            requesterUserId: user.id.toString(),
            requesterRole: user.role,
            name: body.name,
            type: body.type,
            description: body.description,
            pricePerHour: body.pricePerHour,
            capacity: body.capacity,
            features: body.features,
            imageUrl: body.imageUrl,
            rating: body.rating,
            reviewCount: body.reviewCount,
        });

        return {
            room: {
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
                active: room.active,
            },
        };
    }
}
