import { Injectable } from '@nestjs/common';
import { PlatformMercadoPagoPublicKey } from '../../domain/subscription-checkout/application/services/platform-mercadopago-public-key';

@Injectable()
export class EnvPlatformMercadoPagoPublicKeyService extends PlatformMercadoPagoPublicKey {
    get(): string | null {
        const raw = process.env.MERCADOPAGO_PUBLIC_KEY?.trim();
        return raw && raw.length > 0 ? raw : null;
    }
}
