import { Body, Controller, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateBookingMercadoPagoPaymentUseCase } from '../../../domain/booking/application/use-cases/create-booking-mercadopago-payment';
import { Public } from '../../auth/public';
import { CreateBookingMercadoPagoPaymentDto } from '../dtos/create-booking-mercadopago-payment.dto';

@ApiTags('Public Booking')
@Controller('/public/studios/:studioSlug/bookings/:bookingId/mercadopago/payment')
export class CreateBookingMercadoPagoPaymentController {
    constructor(private readonly useCase: CreateBookingMercadoPagoPaymentUseCase) { }

    @Post()
    @Public()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Criar pagamento Mercado Pago (checkout transparente) para a reserva' })
    @ApiParam({ name: 'studioSlug' })
    @ApiParam({ name: 'bookingId' })
    @ApiResponse({ status: 201, description: 'Pagamento criado no MP' })
    @ApiResponse({ status: 404, description: 'Reserva/estúdio inválido ou MP não configurado' })
    async handle(
        @Param('studioSlug') studioSlug: string,
        @Param('bookingId') bookingId: string,
        @Body() body: CreateBookingMercadoPagoPaymentDto,
    ) {
        const result = await this.useCase.execute({
            studioSlug,
            bookingId,
            payerEmail: body.payerEmail,
            paymentMethodId: body.paymentMethodId,
            payerIdentificationType: body.payerIdentificationType,
            payerIdentificationNumber: body.payerIdentificationNumber,
            token: body.token,
            installments: body.installments,
            issuerId: body.issuerId,
        });
        return {
            mercadoPago: {
                paymentId: result.mercadoPagoPaymentId,
                status: result.status,
                payment: result.raw,
            },
        };
    }
}
