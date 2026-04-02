import { BadRequestException, Controller, Headers, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { HandleStripeSubscriptionWebhookUseCase } from '../../../domain/subscription-checkout/application/use-cases/handle-stripe-subscription-webhook';
import { Public } from '../../auth/public';

@ApiTags('Stripe Webhooks')
@Controller('/payments/stripe')
export class StripeWebhookController {
    constructor(
        private handleStripeSubscriptionWebhookUseCase: HandleStripeSubscriptionWebhookUseCase,
    ) { }

    @Post('/webhook')
    @Public()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Receber webhook do Stripe para checkout de assinatura' })
    @ApiResponse({
        status: 200,
        description: 'Webhook processado',
        schema: {
            example: { received: true },
        },
    })
    @ApiResponse({ status: 400, description: 'Assinatura Stripe ausente ou inválida' })
    async handle(
        @Req() req: Request & { rawBody?: Buffer },
        @Headers('stripe-signature') stripeSignature: string,
    ) {
        if (!stripeSignature) {
            throw new BadRequestException('Stripe signature is required');
        }
        const payload = req.rawBody ?? JSON.stringify(req.body);
        try {
            return await this.handleStripeSubscriptionWebhookUseCase.execute({
                payload,
                signature: stripeSignature,
            });
        } catch {
            throw new BadRequestException('Invalid Stripe webhook signature or payload');
        }
    }
}
