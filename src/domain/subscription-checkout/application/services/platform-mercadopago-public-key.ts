/**
 * Chave pública da aplicação Mercado Pago (assinatura da plataforma).
 * Usada no frontend com Mercado Pago.js para tokenizar cartão no fluxo preapproval.
 */
export abstract class PlatformMercadoPagoPublicKey {
    /** Valor trimado ou null se não configurado. */
    abstract get(): string | null;
}
