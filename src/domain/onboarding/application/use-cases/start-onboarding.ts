import { Inject } from '@nestjs/common';
import { UseCaseError } from '../../../../core/errors/use-case-error';
import { OnboardingSession, BillingCycle, DomainType, PaymentMethod, PlanTier } from '../../enterprise/entities/onboarding-session';
import { OnboardingSessionsRepository } from '../repositories/onboarding-sessions-repository';
import { SubdomainAvailabilityChecker } from '../services/subdomain-availability-checker';

export interface StartOnboardingRequest {
    planTier: PlanTier;
    billingCycle: BillingCycle;
    studioName: string;
    ownerName: string;
    ownerEmail: string;
    ownerPhone: string;
    ownerDocument: string;
    domainType: DomainType;
    subdomain?: string;
    customDomain?: string;
    paymentMethod: PaymentMethod;
    totalAmount: number;
}

export interface StartOnboardingResponse {
    onboardingSession: OnboardingSession;
}

export class InvalidOnboardingDomainError extends UseCaseError {
    constructor() { super('Invalid domain configuration'); }
}

export class SubdomainUnavailableError extends UseCaseError {
    constructor() { super('Subdomain is not available'); }
}

export class StartOnboardingUseCase {
    constructor(
        @Inject(OnboardingSessionsRepository)
        private onboardingSessionsRepository: OnboardingSessionsRepository,
        @Inject(SubdomainAvailabilityChecker)
        private subdomainAvailabilityChecker: SubdomainAvailabilityChecker,
    ) { }

    async execute(data: StartOnboardingRequest): Promise<StartOnboardingResponse> {
        if (data.domainType === 'SUBDOMAIN' && !data.subdomain) {
            throw new InvalidOnboardingDomainError();
        }

        if (data.domainType === 'CUSTOM_DOMAIN' && !data.customDomain) {
            throw new InvalidOnboardingDomainError();
        }

        if (data.domainType === 'SUBDOMAIN' && data.subdomain) {
            const isAvailable = await this.subdomainAvailabilityChecker.isAvailable(data.subdomain);
            if (!isAvailable) {
                throw new SubdomainUnavailableError();
            }
        }

        const session = OnboardingSession.create({
            planTier: data.planTier,
            billingCycle: data.billingCycle,
            studioName: data.studioName,
            ownerName: data.ownerName,
            ownerEmail: data.ownerEmail,
            ownerPhone: data.ownerPhone,
            ownerDocument: data.ownerDocument,
            domainType: data.domainType,
            subdomain: data.subdomain ?? null,
            customDomain: data.customDomain ?? null,
            paymentMethod: data.paymentMethod,
            totalAmount: data.totalAmount,
            status: 'PENDING_PAYMENT',
            studioId: null,
            ownerUserId: null,
        });

        await this.onboardingSessionsRepository.create(session);

        return { onboardingSession: session };
    }
}
