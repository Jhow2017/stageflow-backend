import { Inject } from '@nestjs/common';
import { ApproveSubscriptionCheckoutUseCase } from './approve-subscription-checkout';
import { SubscriptionCheckoutSessionsRepository } from '../repositories/subscription-checkout-sessions-repository';
import { MercadoPagoWebhookEventsRepository } from '../repositories/mercadopago-webhook-events-repository';
import { MercadoPagoPlatformSubscriptionGateway } from '../services/mercadopago-platform-subscription-gateway';

export interface HandleMercadoPagoSubscriptionWebhookRequest {
    body: Record<string, unknown>;
}

export interface HandleMercadoPagoSubscriptionWebhookResponse {
    received: boolean;
    ignored?: boolean;
}

function getString(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function parseCheckoutIdFromExternalReference(ref: string): string | null {
    const m = /^subscription-checkout-(.+)$/.exec(ref.trim());
    return m?.[1] ?? null;
}

export class HandleMercadoPagoSubscriptionWebhookUseCase {
    constructor(
        @Inject(MercadoPagoWebhookEventsRepository)
        private mercadoPagoWebhookEventsRepository: MercadoPagoWebhookEventsRepository,
        @Inject(SubscriptionCheckoutSessionsRepository)
        private checkoutSessionsRepository: SubscriptionCheckoutSessionsRepository,
        @Inject(MercadoPagoPlatformSubscriptionGateway)
        private platformGateway: MercadoPagoPlatformSubscriptionGateway,
        private approveSubscriptionCheckoutUseCase: ApproveSubscriptionCheckoutUseCase,
    ) { }

    async execute({ body }: HandleMercadoPagoSubscriptionWebhookRequest): Promise<HandleMercadoPagoSubscriptionWebhookResponse> {
        const topic = getString(body.type) ?? getString(body.topic) ?? 'unknown';
        const data = body.data as { id?: string | number } | undefined;
        const resourceId = data?.id !== undefined ? String(data.id) : null;
        if (!resourceId) {
            return { received: true, ignored: true };
        }

        const dedupeTopic = `subscription:${topic}`;
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

        const isPayment = topic === 'payment' || topic.includes('payment');
        const isPreapproval = topic.includes('preapproval') || topic === 'subscription_preapproval';

        if (isPayment) {
            await this.handlePayment(resourceId);
        } else if (isPreapproval) {
            await this.handlePreapproval(resourceId);
        }

        return { received: true };
    }

    private async handlePayment(paymentId: string): Promise<void> {
        const payment = await this.platformGateway.getPayment(paymentId);
        const status = getString(payment.status);
        if (status !== 'approved' && status !== 'accredited') {
            return;
        }

        const ext = getString(payment.external_reference);
        let checkoutId: string | null = ext ? parseCheckoutIdFromExternalReference(ext) : null;
        if (!checkoutId) {
            const session = await this.checkoutSessionsRepository.findByMercadoPagoPaymentId(paymentId);
            checkoutId = session?.id.toString() ?? null;
        }
        if (!checkoutId) return;

        const checkout = await this.checkoutSessionsRepository.findById(checkoutId);
        if (!checkout || checkout.status !== 'PENDING_PAYMENT') return;

        await this.approveSubscriptionCheckoutUseCase.execute({
            checkoutId,
            paymentReference: paymentId,
        });
    }

    private async handlePreapproval(preapprovalId: string): Promise<void> {
        const pre = await this.platformGateway.getPreapproval(preapprovalId);
        const status = getString(pre.status);
        if (status !== 'authorized') {
            return;
        }

        let checkout = await this.checkoutSessionsRepository.findByMercadoPagoPreapprovalId(preapprovalId);
        if (!checkout) {
            const ext = getString(pre.external_reference);
            const checkoutId = ext ? parseCheckoutIdFromExternalReference(ext) : null;
            if (checkoutId) {
                checkout = await this.checkoutSessionsRepository.findById(checkoutId);
            }
        }
        if (!checkout || checkout.status !== 'PENDING_PAYMENT') return;

        await this.approveSubscriptionCheckoutUseCase.execute({
            checkoutId: checkout.id.toString(),
            paymentReference: preapprovalId,
        });
    }
}
