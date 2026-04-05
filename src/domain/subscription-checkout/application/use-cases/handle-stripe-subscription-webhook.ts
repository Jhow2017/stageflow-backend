import { Inject } from '@nestjs/common';
import { ApproveSubscriptionCheckoutUseCase } from './approve-subscription-checkout';
import { StripeSubscriptionGateway } from '../services/stripe-subscription-gateway';
import { SubscriptionCheckoutSessionsRepository } from '../repositories/subscription-checkout-sessions-repository';
import { StripeWebhookEventsRepository } from '../repositories/stripe-webhook-events-repository';
import { StudiosRepository } from '../../../booking/application/repositories/studios-repository';
import { BookingsRepository } from '../../../booking/application/repositories/bookings-repository';

export interface HandleStripeSubscriptionWebhookRequest {
    payload: Buffer | string;
    signature: string;
}

export interface HandleStripeSubscriptionWebhookResponse {
    received: boolean;
    ignored?: boolean;
}

function getStringField(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value : null;
}

export class HandleStripeSubscriptionWebhookUseCase {
    constructor(
        @Inject(StripeSubscriptionGateway)
        private stripeSubscriptionGateway: StripeSubscriptionGateway,
        @Inject(StripeWebhookEventsRepository)
        private stripeWebhookEventsRepository: StripeWebhookEventsRepository,
        @Inject(SubscriptionCheckoutSessionsRepository)
        private checkoutSessionsRepository: SubscriptionCheckoutSessionsRepository,
        @Inject(StudiosRepository)
        private studiosRepository: StudiosRepository,
        @Inject(BookingsRepository)
        private bookingsRepository: BookingsRepository,
        private approveSubscriptionCheckoutUseCase: ApproveSubscriptionCheckoutUseCase,
    ) { }

    async execute({ payload, signature }: HandleStripeSubscriptionWebhookRequest): Promise<HandleStripeSubscriptionWebhookResponse> {
        const event = this.stripeSubscriptionGateway.constructEvent(payload, signature);

        const alreadyProcessed = await this.stripeWebhookEventsRepository.existsByEventId(event.id);
        if (alreadyProcessed) {
            return { received: true, ignored: true };
        }

        await this.stripeWebhookEventsRepository.create({
            eventId: event.id,
            eventType: event.type,
            payload: event.data.object,
        });

        const object = event.data.object;
        const objectType = getStringField(object.object);

        if (event.type === 'checkout.session.completed' && objectType === 'checkout.session') {
            const checkoutId = getStringField(object.client_reference_id)
                ?? getStringField((object.metadata as Record<string, unknown> | undefined)?.checkoutId);
            const stripeSubscriptionId = getStringField(object.subscription);

            if (checkoutId) {
                const checkout = await this.checkoutSessionsRepository.findById(checkoutId);
                if (checkout && checkout.status === 'PENDING_PAYMENT') {
                    if (stripeSubscriptionId) {
                        checkout.bindStripeSubscription(stripeSubscriptionId);
                        await this.checkoutSessionsRepository.save(checkout);
                    }

                    await this.approveSubscriptionCheckoutUseCase.execute({
                        checkoutId,
                        paymentReference: getStringField(object.id) ?? event.id,
                    });
                }
            }
        }

        if (event.type === 'invoice.payment_failed' && objectType === 'invoice') {
            const checkoutId = getStringField((object.metadata as Record<string, unknown> | undefined)?.checkoutId);
            if (checkoutId) {
                const checkout = await this.checkoutSessionsRepository.findById(checkoutId);
                if (checkout && checkout.status === 'PENDING_PAYMENT') {
                    checkout.reject(getStringField(object.id) ?? event.id);
                    await this.checkoutSessionsRepository.save(checkout);
                }
            }
        }

        if (event.type === 'invoice.paid' && objectType === 'invoice') {
            const checkoutId = getStringField((object.metadata as Record<string, unknown> | undefined)?.checkoutId);
            if (checkoutId) {
                const checkout = await this.checkoutSessionsRepository.findById(checkoutId);
                if (checkout && checkout.status === 'PENDING_PAYMENT') {
                    await this.approveSubscriptionCheckoutUseCase.execute({
                        checkoutId,
                        paymentReference: getStringField(object.id) ?? event.id,
                    });
                }
            }
        }

        if (event.type === 'customer.subscription.deleted' && objectType === 'subscription') {
            const stripeSubscriptionId = getStringField(object.id);
            if (stripeSubscriptionId) {
                // lookup by checkout not available in repo; safe fallback by metadata checkoutId
                const checkoutId = getStringField((object.metadata as Record<string, unknown> | undefined)?.checkoutId);
                if (checkoutId) {
                    const checkout = await this.checkoutSessionsRepository.findById(checkoutId);
                    if (checkout && checkout.status === 'APPROVED') {
                        checkout.expire(event.id);
                        await this.checkoutSessionsRepository.save(checkout);
                    }
                }
            }
        }

        if (event.type === 'account.updated' && objectType === 'account') {
            const accountId = getStringField(object.id);
            if (accountId) {
                const studio = await this.studiosRepository.findByStripeConnectedAccountId(accountId);
                if (studio) {
                    const requirements = (object.requirements as Record<string, unknown> | undefined) ?? {};
                    const currentlyDueRaw = requirements.currently_due;
                    const eventuallyDueRaw = requirements.eventually_due;
                    const currentlyDue = Array.isArray(currentlyDueRaw)
                        ? currentlyDueRaw.filter((i): i is string => typeof i === 'string')
                        : [];
                    const eventuallyDue = Array.isArray(eventuallyDueRaw)
                        ? eventuallyDueRaw.filter((i): i is string => typeof i === 'string')
                        : [];

                    const chargesEnabled = !!object.charges_enabled;
                    const payoutsEnabled = !!object.payouts_enabled;
                    const detailsSubmitted = !!object.details_submitted;
                    const connectStatus = chargesEnabled && payoutsEnabled
                        ? 'ACTIVE'
                        : currentlyDue.length > 0
                            ? 'RESTRICTED'
                            : 'PENDING';

                    studio.updateStripeCapabilities({
                        onboardingComplete: chargesEnabled && payoutsEnabled,
                        chargesEnabled,
                        payoutsEnabled,
                        detailsSubmitted,
                        requirementsCurrentlyDue: currentlyDue,
                        requirementsEventuallyDue: eventuallyDue,
                        connectStatus,
                    });

                    await this.studiosRepository.update({
                        id: studio.id.toString(),
                        ownerUserId: studio.ownerUserId,
                        payoutProvider: studio.payoutProvider,
                        stripeConnectedAccountId: studio.stripeConnectedAccountId,
                        stripeOnboardingComplete: studio.stripeOnboardingComplete,
                        stripeChargesEnabled: studio.stripeChargesEnabled,
                        stripePayoutsEnabled: studio.stripePayoutsEnabled,
                        stripeDetailsSubmitted: studio.stripeDetailsSubmitted,
                        stripeRequirementsCurrentlyDue: studio.stripeRequirementsCurrentlyDue,
                        stripeRequirementsEventuallyDue: studio.stripeRequirementsEventuallyDue,
                        stripeConnectStatus: studio.stripeConnectStatus,
                        name: studio.name,
                        slug: studio.slug,
                        planTier: studio.planTier,
                        logoUrl: studio.logoUrl,
                        primaryColor: studio.primaryColor,
                        openHour: studio.openHour,
                        closeHour: studio.closeHour,
                        timezone: studio.timezone,
                    });
                }
            }
        }

        if (event.type === 'payment_intent.succeeded' && objectType === 'payment_intent') {
            const metadata = (object.metadata as Record<string, unknown> | undefined) ?? {};
            const bookingId = getStringField(metadata.bookingId);
            if (bookingId) {
                const booking = await this.bookingsRepository.findById(bookingId);
                if (booking) {
                    booking.markAsPaid(getStringField(object.id) ?? event.id);
                    await this.bookingsRepository.save(booking);
                }
            }
        }

        if (event.type === 'payment_intent.payment_failed' && objectType === 'payment_intent') {
            const metadata = (object.metadata as Record<string, unknown> | undefined) ?? {};
            const bookingId = getStringField(metadata.bookingId);
            if (bookingId) {
                const booking = await this.bookingsRepository.findById(bookingId);
                if (booking) {
                    booking.markAsFailed(getStringField(object.id) ?? event.id);
                    await this.bookingsRepository.save(booking);
                }
            }
        }

        return { received: true };
    }
}
