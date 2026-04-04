import { Inject } from '@nestjs/common';
import { UseCaseError } from '../../../../core/errors/use-case-error';
import {
    BillingCycle,
    DomainType,
    PaymentMethod,
    PlanTier,
    SubscriptionCheckoutSession,
} from '../../enterprise/entities/subscription-checkout-session';
import { SubscriptionCheckoutSessionsRepository } from '../repositories/subscription-checkout-sessions-repository';
import { SubdomainAvailabilityChecker } from '../services/subdomain-availability-checker';
import { BrDomainAvailabilityGateway } from '../../../domain-availability/application/services/br-domain-availability-gateway';
import { normalizeBrFqdn, isRegisterableIsavailStatus } from '../../../domain-availability/application/br-fqdn';
import { summaryPtFromIsavailResult } from '../../../domain-availability/application/isavail-status-messages';
import { BrDomainAvailabilityQueryFailedError } from '../../../domain-availability/application/errors/br-domain-availability-query-failed-error';
import { BrDomainNotRegisterableError } from '../../../domain-availability/application/errors/br-domain-not-registerable-error';

export interface StartSubscriptionCheckoutRequest {
    subscriberUserId: string;
    subscriberName: string;
    subscriberEmail: string;
    planTier: PlanTier;
    billingCycle: BillingCycle;
    studioName: string;
    domainType: DomainType;
    subdomain?: string;
    customDomain?: string;
    paymentMethod: PaymentMethod;
    totalAmount: number;
}

export interface StartSubscriptionCheckoutResponse {
    checkoutSession: SubscriptionCheckoutSession;
}

export class InvalidCheckoutDomainError extends UseCaseError {
    constructor() { super('Invalid domain configuration'); }
}

export class SubdomainUnavailableError extends UseCaseError {
    constructor() { super('Subdomain is not available'); }
}

const FINAL_SUBDOMAIN_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function applySuffixHeuristics(value: string): string {
    if (value.includes('-')) return value;

    const suffixes = ['studio', 'music', 'audio', 'sonic'];
    for (const suffix of suffixes) {
        if (value.endsWith(suffix) && value.length > suffix.length + 1) {
            const prefix = value.slice(0, -suffix.length);
            return `${prefix}-${suffix}`;
        }
    }

    return value;
}

function normalizeSubdomain(raw: string): string {
    const camelSeparated = raw.replace(/([a-z])([A-Z])/g, '$1-$2');
    const withoutAccents = camelSeparated
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    const lower = withoutAccents.toLowerCase();
    const onlyLettersDigitsSpacesHyphen = lower.replace(/[^a-z0-9\s-]/g, '');
    const withSuffixHeuristics = applySuffixHeuristics(onlyLettersDigitsSpacesHyphen.replace(/\s+/g, ''));
    const spacesToHyphen = withSuffixHeuristics.replace(/\s+/g, '-');
    const collapseHyphens = spacesToHyphen.replace(/-+/g, '-');
    const trimmed = collapseHyphens.replace(/^-+|-+$/g, '');

    return trimmed;
}

export class StartSubscriptionCheckoutUseCase {
    constructor(
        @Inject(SubscriptionCheckoutSessionsRepository)
        private subscriptionCheckoutSessionsRepository: SubscriptionCheckoutSessionsRepository,
        @Inject(SubdomainAvailabilityChecker)
        private subdomainAvailabilityChecker: SubdomainAvailabilityChecker,
        @Inject(BrDomainAvailabilityGateway)
        private brDomainAvailabilityGateway: BrDomainAvailabilityGateway,
    ) { }

    async execute(data: StartSubscriptionCheckoutRequest): Promise<StartSubscriptionCheckoutResponse> {
        if (data.domainType === 'SUBDOMAIN' && !data.subdomain) {
            throw new InvalidCheckoutDomainError();
        }

        if (data.domainType === 'CUSTOM_DOMAIN' && !data.customDomain) {
            throw new InvalidCheckoutDomainError();
        }

        let normalizedCustomDomain: string | null = null;
        if (data.domainType === 'CUSTOM_DOMAIN' && data.customDomain) {
            try {
                normalizedCustomDomain = normalizeBrFqdn(data.customDomain);
            } catch {
                throw new InvalidCheckoutDomainError();
            }

            let availability: Awaited<ReturnType<BrDomainAvailabilityGateway['checkAvailability']>>;
            try {
                availability = await this.brDomainAvailabilityGateway.checkAvailability(normalizedCustomDomain);
            } catch {
                throw new BrDomainAvailabilityQueryFailedError();
            }

            if (availability.statusCode === 8) {
                throw new BrDomainAvailabilityQueryFailedError(summaryPtFromIsavailResult(availability));
            }

            if (availability.statusCode < 0 || availability.statusCode > 9) {
                throw new BrDomainAvailabilityQueryFailedError();
            }

            if (!isRegisterableIsavailStatus(availability.statusCode)) {
                throw new BrDomainNotRegisterableError(summaryPtFromIsavailResult(availability));
            }
        }

        let normalizedSubdomain: string | null = null;
        if (data.domainType === 'SUBDOMAIN' && data.subdomain) {
            normalizedSubdomain = normalizeSubdomain(data.subdomain);

            if (normalizedSubdomain.length < 3 || !FINAL_SUBDOMAIN_REGEX.test(normalizedSubdomain)) {
                throw new InvalidCheckoutDomainError();
            }

            const isAvailable = await this.subdomainAvailabilityChecker.isAvailable(normalizedSubdomain);
            if (!isAvailable) {
                throw new SubdomainUnavailableError();
            }
        }

        const session = SubscriptionCheckoutSession.create({
            planTier: data.planTier,
            billingCycle: data.billingCycle,
            studioName: data.studioName,
            ownerName: data.subscriberName,
            ownerEmail: data.subscriberEmail,
            domainType: data.domainType,
            subdomain: normalizedSubdomain,
            customDomain: normalizedCustomDomain ?? data.customDomain ?? null,
            paymentMethod: data.paymentMethod,
            totalAmount: data.totalAmount,
            status: 'PENDING_PAYMENT',
            studioId: null,
            subscriberUserId: data.subscriberUserId,
            paymentReference: null,
            stripeCheckoutSessionId: null,
            stripeCustomerId: null,
            stripeSubscriptionId: null,
        });

        await this.subscriptionCheckoutSessionsRepository.create(session);

        return { checkoutSession: session };
    }
}
