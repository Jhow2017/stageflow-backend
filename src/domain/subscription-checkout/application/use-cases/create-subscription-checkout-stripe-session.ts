import { Inject } from '@nestjs/common';
import { UseCaseError } from '../../../../core/errors/use-case-error';
import { Role } from '../../../auth/enterprise/value-objects/role';
import { SubscriptionCheckoutSessionsRepository } from '../repositories/subscription-checkout-sessions-repository';
import { CreateSubscriptionCheckoutSessionResponse, StripeSubscriptionGateway } from '../services/stripe-subscription-gateway';
import { SubscriptionCheckoutAccessDeniedError, SubscriptionCheckoutSessionNotFoundError } from './get-subscription-checkout';

export interface CreateSubscriptionCheckoutStripeSessionRequest {
    checkoutId: string;
    requesterUserId: string;
    requesterRole: Role;
}

export interface CreateSubscriptionCheckoutStripeSessionResponse {
    sessionId: string;
    /** URL do Checkout hospedado Stripe (redirect no navegador). */
    url: string;
}

export class SubscriptionCheckoutAlreadyApprovedError extends UseCaseError {
    constructor() {
        super('Subscription checkout is not pending payment');
    }
}

export class SubscriptionCheckoutNotStripeProviderError extends UseCaseError {
    constructor() {
        super('This subscription checkout uses Mercado Pago; use the Mercado Pago payment endpoints');
    }
}

export class CreateSubscriptionCheckoutStripeSessionUseCase {
    constructor(
        @Inject(SubscriptionCheckoutSessionsRepository)
        private checkoutSessionsRepository: SubscriptionCheckoutSessionsRepository,
        @Inject(StripeSubscriptionGateway)
        private stripeSubscriptionGateway: StripeSubscriptionGateway,
    ) { }

    async execute({
        checkoutId,
        requesterUserId,
        requesterRole,
    }: CreateSubscriptionCheckoutStripeSessionRequest): Promise<CreateSubscriptionCheckoutStripeSessionResponse> {
        const checkout = await this.checkoutSessionsRepository.findById(checkoutId);
        if (!checkout) throw new SubscriptionCheckoutSessionNotFoundError();

        if (requesterRole !== Role.OWNER && checkout.subscriberUserId !== requesterUserId) {
            throw new SubscriptionCheckoutAccessDeniedError();
        }

        if (checkout.status !== 'PENDING_PAYMENT') {
            throw new SubscriptionCheckoutAlreadyApprovedError();
        }

        if (checkout.platformPaymentProvider !== 'STRIPE') {
            throw new SubscriptionCheckoutNotStripeProviderError();
        }

        const stripeSession: CreateSubscriptionCheckoutSessionResponse =
            await this.stripeSubscriptionGateway.createSubscriptionCheckoutSession({
                checkoutId: checkout.id.toString(),
                customerEmail: checkout.ownerEmail,
                customerName: checkout.ownerName,
                planTier: checkout.planTier,
                billingCycle: checkout.billingCycle,
                domainType: checkout.domainType,
                paymentMethod: checkout.paymentMethod,
                metadata: {
                    checkoutId: checkout.id.toString(),
                    subscriberUserId: checkout.subscriberUserId ?? '',
                },
            });

        checkout.bindStripeCheckoutSession(stripeSession.sessionId, stripeSession.customerId);
        await this.checkoutSessionsRepository.save(checkout);

        return {
            sessionId: stripeSession.sessionId,
            url: stripeSession.url,
        };
    }
}
