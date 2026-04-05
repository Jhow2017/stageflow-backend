import { BadRequestException, Body, Controller, Headers, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { Request } from 'express';
import { HandleMercadoPagoDeauthorizationWebhookUseCase } from '../../../domain/auth/application/use-cases/handle-mercadopago-deauthorization-webhook';
import { HandleMercadoPagoReservationWebhookUseCase } from '../../../domain/booking/application/use-cases/handle-mercadopago-reservation-webhook';
import { HandleMercadoPagoSubscriptionWebhookUseCase } from '../../../domain/subscription-checkout/application/use-cases/handle-mercadopago-subscription-webhook';
import { MercadoPagoWebhookSignatureValidator } from '../../mercadopago/mercado-pago-webhook-signature-validator';
import { Public } from '../../auth/public';

@ApiTags('Mercado Pago Webhooks')
@SkipThrottle()
@Controller()
export class MercadoPagoWebhooksController {
    constructor(
        private readonly signatureValidator: MercadoPagoWebhookSignatureValidator,
        private readonly handleSubscriptionWebhook: HandleMercadoPagoSubscriptionWebhookUseCase,
        private readonly handleReservationWebhook: HandleMercadoPagoReservationWebhookUseCase,
        private readonly handleDeauthorizationWebhook: HandleMercadoPagoDeauthorizationWebhookUseCase,
    ) { }

    @Post('webhooks/mercadopago/subscription')
    @Public()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Webhook Mercado Pago — assinatura da plataforma' })
    @ApiResponse({ status: 200, description: 'Evento recebido' })
    async subscription(
        @Req() req: Request & { rawBody?: Buffer },
        @Headers('x-signature') signature: string | undefined,
    ) {
        const raw = (req.rawBody ?? Buffer.from(JSON.stringify(req.body ?? {}))).toString('utf8');
        if (!this.signatureValidator.isValid(raw, signature)) {
            throw new BadRequestException('Invalid Mercado Pago webhook signature');
        }
        return this.handleSubscriptionWebhook.execute({ body: req.body as Record<string, unknown> });
    }

    @Post('webhooks/reservations/mercadopago')
    @Public()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Webhook Mercado Pago — pagamento de reserva' })
    @ApiResponse({ status: 200, description: 'Evento recebido' })
    async reservation(
        @Req() req: Request & { rawBody?: Buffer },
        @Headers('x-signature') signature: string | undefined,
    ) {
        const raw = (req.rawBody ?? Buffer.from(JSON.stringify(req.body ?? {}))).toString('utf8');
        if (!this.signatureValidator.isValid(raw, signature)) {
            throw new BadRequestException('Invalid Mercado Pago webhook signature');
        }
        return this.handleReservationWebhook.execute({ body: req.body as Record<string, unknown> });
    }

    @Post('webhooks/mercadopago/deauthorization')
    @Public()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Webhook Mercado Pago — desautorização OAuth do vendedor' })
    @ApiResponse({ status: 200, description: 'Processado' })
    async deauthorization(@Body() body: { user_id?: string | number; action?: string }) {
        if (body.action !== 'application.deauthorized') {
            return { received: true, ignored: true };
        }
        const uid = body.user_id !== undefined ? String(body.user_id).trim() : '';
        if (!uid) {
            return { received: true, ignored: true };
        }
        return this.handleDeauthorizationWebhook.execute({ mercadoPagoUserId: uid });
    }
}
