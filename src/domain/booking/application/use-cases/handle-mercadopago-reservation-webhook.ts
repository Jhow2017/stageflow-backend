import { Inject } from '@nestjs/common';
import { BookingsRepository } from '../repositories/bookings-repository';
import { StudiosRepository } from '../repositories/studios-repository';
import { MercadoPagoWebhookEventsRepository } from '../../../subscription-checkout/application/repositories/mercadopago-webhook-events-repository';
import { MercadoPagoSellerBookingPaymentReader } from '../services/mercado-pago-seller-booking-payment-reader';

export interface HandleMercadoPagoReservationWebhookRequest {
    body: Record<string, unknown>;
}

export interface HandleMercadoPagoReservationWebhookResponse {
    received: boolean;
    ignored?: boolean;
}

function getString(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

export class HandleMercadoPagoReservationWebhookUseCase {
    constructor(
        @Inject(MercadoPagoWebhookEventsRepository)
        private mercadoPagoWebhookEventsRepository: MercadoPagoWebhookEventsRepository,
        @Inject(BookingsRepository)
        private bookingsRepository: BookingsRepository,
        @Inject(StudiosRepository)
        private studiosRepository: StudiosRepository,
        @Inject(MercadoPagoSellerBookingPaymentReader)
        private sellerPaymentReader: MercadoPagoSellerBookingPaymentReader,
    ) { }

    async execute({ body }: HandleMercadoPagoReservationWebhookRequest): Promise<HandleMercadoPagoReservationWebhookResponse> {
        const topic = getString(body.type) ?? getString(body.topic) ?? 'unknown';
        const data = body.data as { id?: string | number } | undefined;
        const resourceId = data?.id !== undefined ? String(data.id) : null;
        if (!resourceId) {
            return { received: true, ignored: true };
        }

        const dedupeTopic = `reservation:${topic}`;
        const already = await this.mercadoPagoWebhookEventsRepository.existsByResourceIdAndTopic(
            resourceId,
            dedupeTopic,
        );
        if (already) {
            return { received: true, ignored: true };
        }

        await this.mercadoPagoWebhookEventsRepository.create({
            resourceId,
            topic: dedupeTopic,
            payload: body,
        });

        const booking = await this.bookingsRepository.findByMercadoPagoPaymentId(resourceId);
        if (!booking) {
            return { received: true, ignored: true };
        }

        const studio = await this.studiosRepository.findById(booking.studioId);
        if (!studio?.ownerUserId) {
            return { received: true, ignored: true };
        }

        let payment: Record<string, unknown>;
        try {
            payment = await this.sellerPaymentReader.getPayment(studio.ownerUserId, resourceId);
        } catch {
            return { received: true };
        }

        const status = getString(payment.status);
        if (status === 'approved' || status === 'accredited') {
            booking.markAsPaid(resourceId);
            await this.bookingsRepository.save(booking);
        } else if (status === 'rejected' || status === 'cancelled') {
            booking.markAsFailed(resourceId);
            await this.bookingsRepository.save(booking);
        }

        return { received: true };
    }
}
