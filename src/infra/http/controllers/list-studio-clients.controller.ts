import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ListStudioClientsUseCase } from '../../../domain/booking/application/use-cases/list-studio-clients';
import { AdminGuard } from '../../auth/admin.guard';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@ApiTags('Clients Admin')
@Controller('/admin/studio-ops/:studioSlug/clients')
@UseGuards(JwtAuthGuard, AdminGuard)
export class ListStudioClientsController {
    constructor(private listStudioClientsUseCase: ListStudioClientsUseCase) { }

    @Get()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Listar clientes do studio (admin)' })
    @ApiParam({ name: 'studioSlug', example: 'studio-beat-lab' })
    @ApiResponse({
        status: 200,
        description: 'Clientes do studio',
        schema: {
            example: {
                clients: [
                    {
                        id: 'uuid-do-cliente',
                        userId: 'uuid-do-usuario-ou-null',
                        name: 'Jonathan Nascimento',
                        email: 'jhonga@email.com',
                        phone: '11999990000',
                        notes: 'Prefere sala A',
                    },
                ],
            },
        },
    })
    @ApiResponse({ status: 401, description: 'Não autenticado' })
    @ApiResponse({ status: 403, description: 'Acesso negado (apenas admin)' })
    @ApiResponse({ status: 404, description: 'Studio não encontrado' })
    async handle(@Param('studioSlug') studioSlug: string) {
        const { clients } = await this.listStudioClientsUseCase.execute({ studioSlug });

        return {
            clients: clients.map((client) => ({
                id: client.id.toString(),
                userId: client.userId,
                name: client.name,
                email: client.email,
                phone: client.phone,
                notes: client.notes,
            })),
        };
    }
}
