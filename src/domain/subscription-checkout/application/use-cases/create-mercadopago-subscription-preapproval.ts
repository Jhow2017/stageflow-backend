import { Inject } from '@nestjs/common';
import { UseCaseError } from '../../../../core/errors/use-case-error';
import { Role } from '../../../auth/enterprise/value-objects/role';
import { MercadoPagoPlatformSubscriptionGateway } from '../services/mercadopago-platform-subscription-gateway';
import { SubscriptionCheckoutSessionsRepository } from '../repositories/subscription-checkout-sessions-repository';
import { SubscriptionCheckoutAccessDeniedError, SubscriptionCheckoutSessionNotFoundError } from './get-subscription-checkout';
import { SubscriptionCheckoutAlreadyApprovedError } from './create-subscription-checkout-stripe-session';

export class SubscriptionCheckoutNotMercadoPagoProviderError extends UseCaseError {
    constructor() {
        super('This subscription checkout uses Stripe; use Stripe session endpoint');
    }
}

export class SubscriptionCheckoutPreapprovalNotCardError extends UseCaseError {
    constructor() {
        super('Mercado Pago preapproval applies to card subscription checkout');
    }
}

export class SubscriptionCheckoutMercadoPagoPreapprovalMissingError extends UseCaseError {
    constructor() {
        super('Create Mercado Pago preapproval before attaching the card token');
    }
}

export interface CreateMercadoPagoSubscriptionPreapprovalRequest {
    checkoutId: string;
    requesterUserId: string;
    requesterRole: Role;
}

export interface CreateMercadoPagoSubscriptionPreapprovalResponse {
    mercadoPagoPreapprovalId: string;
}

export class CreateMercadoPagoSubscriptionPreapprovalUseCase {
    constructor(
        @Inject(SubscriptionCheckoutSessionsRepository)
        private checkoutSessionsRepository: SubscriptionCheckoutSessionsRepository,
        @Inject(MercadoPagoPlatformSubscriptionGateway)
        private mercadoPagoGateway: MercadoPagoPlatformSubscriptionGateway,
    ) { }

    async execute(
        req: CreateMercadoPagoSubscriptionPreapprovalRequest,
    ): Promise<CreateMercadoPagoSubscriptionPreapprovalResponse> {
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

        const planLabel = `Reserva Estúdio ${checkout.planTier} ${checkout.billingCycle}`;
        const { id } = await this.mercadoPagoGateway.createPendingPreapproval({
            checkoutId: checkout.id.toString(),
            ownerEmail: checkout.ownerEmail,
            planLabel,
            amountReaisPerCycle: checkout.totalAmount,
            billingCycle: checkout.billingCycle,
        });

        checkout.bindMercadoPagoPreapproval(id);
        await this.checkoutSessionsRepository.save(checkout);

        return { mercadoPagoPreapprovalId: id };
    }
}
