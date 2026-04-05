import { UseCaseError } from '../../../../core/errors/use-case-error';

/** Dono do estúdio sem OAuth/credenciais manuais Mercado Pago válidas para recebimento. */
export class MercadoPagoSellerNotConnectedError extends UseCaseError {
    constructor() {
        super('Studio owner has not connected Mercado Pago (OAuth or manual credentials)');
    }
}
