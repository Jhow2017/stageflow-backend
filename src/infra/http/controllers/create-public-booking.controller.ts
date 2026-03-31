import { Body, Controller, HttpCode, HttpStatus, Inject, Param, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreatePublicBookingUseCase } from '../../../domain/booking/application/use-cases/create-public-booking';
import { AuditLogger } from '../../../domain/auth/application/services/audit-logger';
import { Public } from '../../auth/public';
import { CreatePublicBookingDto } from '../dtos/create-public-booking.dto';

@ApiTags('Public Booking')
@Controller('/public/studios/:studioSlug/bookings')
export class CreatePublicBookingController {
    constructor(
        private createPublicBookingUseCase: CreatePublicBookingUseCase,
        @Inject(AuditLogger) private auditLogger: AuditLogger,
    ) { }

    @Post()
    @Public()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Criar reserva pública' })
    @ApiParam({ name: 'studioSlug', example: 'studio-beat-lab' })
    @ApiBody({ type: CreatePublicBookingDto })
    @ApiResponse({
        status: 201,
        description: 'Reserva criada',
        schema: {
            example: {
                booking: {
                    id: 'uuid-da-reserva',
                    studioId: 'uuid-do-studio',
                    roomId: 'uuid-da-sala',
                    clientId: 'uuid-do-cliente',
                    bookingDate: '2026-04-01T00:00:00.000Z',
                    startHour: 8,
                    endHour: 10,
                    totalPrice: 160,
                    status: 'CONFIRMED',
                    paymentMethod: null,
                    paymentStatus: 'PAID',
                    createdAt: '2026-03-31T20:00:00.000Z',
                },
                accountCreated: false,
            },
        },
    })
    @ApiResponse({ status: 400, description: 'Payload inválido, data passada ou faixa inválida' })
    @ApiResponse({ status: 404, description: 'Studio ou sala não encontrado' })
    @ApiResponse({ status: 409, description: 'Conflito de horário para a sala/data' })
    async handle(
        @Param('studioSlug') studioSlug: string,
        @Req() req: Request,
        @Body() body: CreatePublicBookingDto,
    ) {
        const { booking, accountCreated } = await this.createPublicBookingUseCase.execute({
            studioSlug: String(studioSlug),
            roomId: body.roomId,
            year: body.year,
            month: body.month,
            day: body.day,
            startHour: body.startHour,
            endHour: body.endHour,
            customerName: body.customerName,
            customerEmail: body.customerEmail,
            customerPhone: body.customerPhone,
            notes: body.notes,
            createAccount: body.createAccount,
            paymentMethod: body.paymentMethod,
            status: body.paymentMethod ? 'PENDING' : 'CONFIRMED',
        });

        await this.auditLogger.log({
            userId: null,
            action: 'PUBLIC_BOOKING_CREATED',
            entityType: 'Booking',
            entityId: booking.id.toString(),
            metadata: {
                studioSlug,
                roomId: body.roomId,
                bookingDate: `${body.year}-${body.month}-${body.day}`,
                startHour: body.startHour,
                endHour: body.endHour,
                createAccount: !!body.createAccount,
            },
            ipAddress: req.ip || req.socket.remoteAddress || null,
            userAgent: req.get('user-agent') || null,
        });

        return {
            booking: {
                id: booking.id.toString(),
                studioId: booking.studioId,
                roomId: booking.roomId,
                clientId: booking.clientId,
                bookingDate: booking.bookingDate,
                startHour: booking.startHour,
                endHour: booking.endHour,
                totalPrice: booking.totalPrice,
                status: booking.status,
                paymentMethod: booking.paymentMethod,
                paymentStatus: booking.paymentStatus,
                createdAt: booking.createdAt,
            },
            accountCreated,
        };
    }
}
