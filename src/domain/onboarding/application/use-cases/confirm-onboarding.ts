import { Inject } from '@nestjs/common';
import { UseCaseError } from '../../../../core/errors/use-case-error';
import { OnboardingSession } from '../../enterprise/entities/onboarding-session';
import { OnboardingSessionsRepository } from '../repositories/onboarding-sessions-repository';
import { StudioProvisioningService } from '../services/studio-provisioning-service';
import { OnboardingSessionNotFoundError } from './get-onboarding-session';

export interface ConfirmOnboardingRequest {
    onboardingId: string;
}

export interface ConfirmOnboardingResponse {
    onboardingSession: OnboardingSession;
}

export class InvalidOnboardingStatusError extends UseCaseError {
    constructor() {
        super('Onboarding session cannot be confirmed in current status');
    }
}

export class ConfirmOnboardingUseCase {
    constructor(
        @Inject(OnboardingSessionsRepository)
        private onboardingSessionsRepository: OnboardingSessionsRepository,
        @Inject(StudioProvisioningService)
        private studioProvisioningService: StudioProvisioningService,
    ) { }

    async execute({ onboardingId }: ConfirmOnboardingRequest): Promise<ConfirmOnboardingResponse> {
        const onboardingSession = await this.onboardingSessionsRepository.findById(onboardingId);

        if (!onboardingSession) {
            throw new OnboardingSessionNotFoundError();
        }

        if (onboardingSession.status !== 'PENDING_PAYMENT') {
            throw new InvalidOnboardingStatusError();
        }

        const provisioning = await this.studioProvisioningService.provisionFromOnboarding(onboardingSession);

        onboardingSession.setProvisioningResult(provisioning.studioId, provisioning.ownerUserId);
        await this.onboardingSessionsRepository.save(onboardingSession);

        return { onboardingSession };
    }
}
