import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ListStudioClientsUseCase } from '../../../domain/booking/application/use-cases/list-studio-clients';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { User } from '../../../domain/auth/enterprise/entities/user';

@ApiTags('Clients Admin')
@Controller('/admin/studio-ops/:studioSlug/clients')
@UseGuards(JwtAuthGuard)
export class ListStudioClientsController {
    constructor(private listStudioClientsUseCase: ListStudioClientsUseCase) { }

    @Get()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Listar clientes do studio (assinante USER vinculado ou OWNER)' })
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
    @ApiResponse({ status: 403, description: 'Acesso negado para este studio (sem vínculo)' })
    @ApiResponse({ status: 404, description: 'Studio não encontrado' })
    async handle(@Param('studioSlug') studioSlug: string, @Req() req: Request) {
        const user = req.user as User;
        const { clients } = await this.listStudioClientsUseCase.execute({
            studioSlug,
            requesterUserId: user.id.toString(),
            requesterRole: user.role,
        });

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
