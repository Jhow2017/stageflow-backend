import { Controller, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateBookingPaymentIntentUseCase } from '../../../domain/booking/application/use-cases/create-booking-payment-intent';
import { Public } from '../../auth/public';

@ApiTags('Public Booking')
@Controller('/public/studios/:studioSlug/bookings/:bookingId/payment-intent')
export class CreateBookingPaymentIntentController {
    constructor(
        private createBookingPaymentIntentUseCase: CreateBookingPaymentIntentUseCase,
    ) { }

    @Post()
    @Public()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary:
            'Iniciar pagamento da reserva: Stripe (PaymentIntent) ou contexto Mercado Pago (publicKey + valor)',
    })
    @ApiParam({ name: 'studioSlug', example: 'super-sonic' })
    @ApiParam({ name: 'bookingId', example: 'uuid-da-reserva' })
    @ApiResponse({
        status: 201,
        description: 'Stripe: PaymentIntent; Mercado Pago: dados para tokenizar no front',
    })
    @ApiResponse({ status: 404, description: 'Reserva não encontrada ou studio indisponível para cobrança' })
    async handle(
        @Param('studioSlug') studioSlug: string,
        @Param('bookingId') bookingId: string,
    ) {
        const payment = await this.createBookingPaymentIntentUseCase.execute({
            studioSlug,
            bookingId,
        });

        return { payment };
    }
}
