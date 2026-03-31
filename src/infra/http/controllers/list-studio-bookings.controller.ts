import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ListStudioBookingsUseCase } from '../../../domain/booking/application/use-cases/list-studio-bookings';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { User } from '../../../domain/auth/enterprise/entities/user';

@ApiTags('Bookings Admin')
@Controller('/admin/studio-ops/:studioSlug/bookings')
@UseGuards(JwtAuthGuard)
export class ListStudioBookingsController {
    constructor(private listStudioBookingsUseCase: ListStudioBookingsUseCase) { }

    @Get()
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Listar reservas do studio (assinante USER vinculado ou OWNER)' })
    @ApiParam({ name: 'studioSlug', example: 'studio-beat-lab' })
    @ApiResponse({
        status: 200,
        description: 'Reservas do studio',
        schema: {
            example: {
                bookings: [
                    {
                        id: 'uuid-da-reserva',
                        roomId: 'uuid-da-sala',
                        clientId: 'uuid-do-cliente',
                        bookingDate: '2026-04-01T00:00:00.000Z',
                        startHour: 8,
                        endHour: 10,
                        totalPrice: 160,
                        status: 'CONFIRMED',
                        paymentStatus: 'PAID',
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
        const { bookings } = await this.listStudioBookingsUseCase.execute({
            studioSlug,
            requesterUserId: user.id.toString(),
            requesterRole: user.role,
        });

        return {
            bookings: bookings.map((booking) => ({
                id: booking.id.toString(),
                roomId: booking.roomId,
                clientId: booking.clientId,
                bookingDate: booking.bookingDate,
                startHour: booking.startHour,
                endHour: booking.endHour,
                totalPrice: booking.totalPrice,
                status: booking.status,
                paymentStatus: booking.paymentStatus,
            })),
        };
    }
}
