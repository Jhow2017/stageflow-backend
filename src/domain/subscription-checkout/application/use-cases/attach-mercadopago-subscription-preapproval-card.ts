import { Inject } from '@nestjs/common';
import { Role } from '../../../auth/enterprise/value-objects/role';
import { MercadoPagoPlatformSubscriptionGateway } from '../services/mercadopago-platform-subscription-gateway';
import { SubscriptionCheckoutSessionsRepository } from '../repositories/subscription-checkout-sessions-repository';
import { SubscriptionCheckoutAccessDeniedError, SubscriptionCheckoutSessionNotFoundError } from './get-subscription-checkout';
import { SubscriptionCheckoutAlreadyApprovedError } from './create-subscription-checkout-stripe-session';
import {
    SubscriptionCheckoutMercadoPagoPreapprovalMissingError,
    SubscriptionCheckoutNotMercadoPagoProviderError,
    SubscriptionCheckoutPreapprovalNotCardError,
} from './create-mercadopago-subscription-preapproval';

export interface AttachMercadoPagoSubscriptionPreapprovalCardRequest {
    checkoutId: string;
    cardTokenId: string;
    requesterUserId: string;
    requesterRole: Role;
}

export class AttachMercadoPagoSubscriptionPreapprovalCardUseCase {
    constructor(
        @Inject(SubscriptionCheckoutSessionsRepository)
        private checkoutSessionsRepository: SubscriptionCheckoutSessionsRepository,
        @Inject(MercadoPagoPlatformSubscriptionGateway)
        private mercadoPagoGateway: MercadoPagoPlatformSubscriptionGateway,
    ) { }

    async execute(req: AttachMercadoPagoSubscriptionPreapprovalCardRequest): Promise<{ ok: true }> {
        const checkout = await this.checkoutSessionsRepository.findById(req.checkoutId);
        if (!checkout) throw new SubscriptionCheckoutSessionNotFoundError();

        if (req.requesterRole !== Role.OWNER && checkout.subscriberUserId !== req.requesterUserId) {
            throw new SubscriptionCheckoutAccessDeniedError();
        }

        if (checkout.status !== 'PENDING_PAYMENT') {
            throw new SubscriptionCheckoutAlreadyApprovedError();
        }

        if (checkout.platformPaymentProvider !== 'MERCADOPAGO') {
            throw new SubscriptionCheckoutNotMercadoPagoProviderError();
        }

        if (checkout.paymentMethod !== 'CARD') {
            throw new SubscriptionCheckoutPreapprovalNotCardError();
        }

        if (!checkout.mercadoPagoPreapprovalId) {
            throw new SubscriptionCheckoutMercadoPagoPreapprovalMissingError();
        }

        await this.mercadoPagoGateway.attachCardToPreapproval(checkout.mercadoPagoPreapprovalId, req.cardTokenId);

        return { ok: true };
    }
}
