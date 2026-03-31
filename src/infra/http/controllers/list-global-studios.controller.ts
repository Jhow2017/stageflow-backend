import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { GetGlobalStudioDetailsUseCase } from '../../../domain/booking/application/use-cases/get-global-studio-details';
import { ListGlobalStudiosUseCase } from '../../../domain/booking/application/use-cases/list-global-studios';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PlatformAdminGuard } from '../../auth/platform-admin.guard';

@ApiTags('Admin Studios')
@Controller('/admin/studios')
@UseGuards(JwtAuthGuard, PlatformAdminGuard)
export class ListGlobalStudiosController {
    constructor(
        private listGlobalStudiosUseCase: ListGlobalStudiosUseCase,
        private getGlobalStudioDetailsUseCase: GetGlobalStudioDetailsUseCase,
    ) { }

    @Get()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Listar todos os studios da plataforma (OWNER)' })
    @ApiResponse({ status: 200, description: 'Studios globais retornados com sucesso' })
    @ApiResponse({ status: 403, description: 'Acesso negado (somente OWNER)' })
    async list() {
        const { studios } = await this.listGlobalStudiosUseCase.execute();

        return {
            studios: studios.map((item) => ({
                id: item.studio.id.toString(),
                name: item.studio.name,
                slug: item.studio.slug,
                planTier: item.studio.planTier,
                timezone: item.studio.timezone,
                roomsCount: item.roomsCount,
                bookingsCount: item.bookingsCount,
                clientsCount: item.clientsCount,
                status: item.status,
                createdAt: item.studio.createdAt,
            })),
        };
    }

    @Get('/:studioId')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Detalhar studio da plataforma (OWNER)' })
    @ApiParam({ name: 'studioId' })
    @ApiResponse({ status: 200, description: 'Detalhes do studio retornados com sucesso' })
    @ApiResponse({ status: 404, description: 'Studio não encontrado' })
    async details(@Param('studioId') studioId: string) {
        const { studio } = await this.getGlobalStudioDetailsUseCase.execute({ studioId });

        return {
            studio: {
                id: studio.studio.id.toString(),
                name: studio.studio.name,
                slug: studio.studio.slug,
                planTier: studio.studio.planTier,
                timezone: studio.studio.timezone,
                roomsCount: studio.roomsCount,
                bookingsCount: studio.bookingsCount,
                clientsCount: studio.clientsCount,
                status: studio.status,
                createdAt: studio.studio.createdAt,
                updatedAt: studio.studio.updatedAt,
            },
        };
    }
}
