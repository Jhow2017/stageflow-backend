export abstract class MercadoPagoSellerBookingPaymentReader {
    abstract getPayment(studioOwnerUserId: string, paymentId: string): Promise<Record<string, unknown>>;
}
