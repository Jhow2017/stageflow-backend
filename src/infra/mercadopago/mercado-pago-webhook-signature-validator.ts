import { createHmac, timingSafeEqual } from 'crypto';
import { Injectable, Logger } from '@nestjs/common';

/**
 * Valida assinatura HMAC dos webhooks Mercado Pago (header x-signature).
 * Use MERCADOPAGO_WEBHOOK_SECRET_KEY (conforme padrão GigManager / doc operacional).
 */
@Injectable()
export class MercadoPagoWebhookSignatureValidator {
    private readonly logger = new Logger(MercadoPagoWebhookSignatureValidator.name);

    isValid(rawBodyForSigning: string, signatureHeader: string | undefined): boolean {
        const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET_KEY?.trim();
        if (!secret) {
            if (process.env.NODE_ENV === 'production') {
                this.logger.warn('MERCADOPAGO_WEBHOOK_SECRET_KEY not set; rejecting webhooks in production');
                return false;
            }
            this.logger.warn('MERCADOPAGO_WEBHOOK_SECRET_KEY not set; accepting webhook in non-production');
            return true;
        }

        if (!signatureHeader) {
            return false;
        }

        const expected = createHmac('sha256', secret).update(rawBodyForSigning).digest('hex');
        try {
            return timingSafeEqual(Buffer.from(signatureHeader), Buffer.from(expected));
        } catch {
            return false;
        }
    }
}
