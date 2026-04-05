import { Injectable } from '@nestjs/common';
import { MercadoPagoBookingApplicationFeeConfig } from '../../domain/booking/application/services/mercado-pago-booking-application-fee-config';
import { mercadoPagoApplicationFeePercent } from './mercado-pago-env';

@Injectable()
export class EnvMercadoPagoBookingFeeConfigService extends MercadoPagoBookingApplicationFeeConfig {
    getPercent(): number {
        return mercadoPagoApplicationFeePercent();
    }
}
