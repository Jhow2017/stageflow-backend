import { Inject } from '@nestjs/common';
import { UseCaseError } from '../../../../core/errors/use-case-error';
import { Role } from '../../../auth/enterprise/value-objects/role';
import { SubscriptionCheckoutSessionsRepository } from '../repositories/subscription-checkout-sessions-repository';
import { CreateEmbeddedSubscriptionSessionResponse, StripeSubscriptionGateway } from '../services/stripe-subscription-gateway';
import { SubscriptionCheckoutAccessDeniedError, SubscriptionCheckoutSessionNotFoundError } from './get-subscription-checkout';

export interface CreateSubscriptionCheckoutStripeSessionRequest {
    checkoutId: string;
    requesterUserId: string;
    requesterRole: Role;
}

export interface CreateSubscriptionCheckoutStripeSessionResponse {
    sessionId: string;
    clientSecret: string;
}

export class SubscriptionCheckoutAlreadyApprovedError extends UseCaseError {
    constructor() {
        super('Subscription checkout is not pending payment');
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

        const stripeSession: CreateEmbeddedSubscriptionSessionResponse =
            await this.stripeSubscriptionGateway.createEmbeddedSubscriptionSession({
                checkoutId: checkout.id.toString(),
                customerEmail: checkout.ownerEmail,
                customerName: checkout.ownerName,
                planTier: checkout.planTier,
                billingCycle: checkout.billingCycle,
                domainType: checkout.domainType,
                metadata: {
                    checkoutId: checkout.id.toString(),
                    subscriberUserId: checkout.subscriberUserId ?? '',
                },
            });

        checkout.bindStripeCheckoutSession(stripeSession.sessionId, stripeSession.customerId);
        await this.checkoutSessionsRepository.save(checkout);

        return {
            sessionId: stripeSession.sessionId,
            clientSecret: stripeSession.clientSecret,
        };
    }
}
