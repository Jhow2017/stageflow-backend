import { Inject } from '@nestjs/common';
import { UseCaseError } from '../../../../core/errors/use-case-error';
import { OnboardingSession } from '../../enterprise/entities/onboarding-session';
import { OnboardingSessionsRepository } from '../repositories/onboarding-sessions-repository';

export interface GetOnboardingSessionRequest {
    onboardingId: string;
}

export interface GetOnboardingSessionResponse {
    onboardingSession: OnboardingSession;
}

export class OnboardingSessionNotFoundError extends UseCaseError {
    constructor() {
        super('Onboarding session not found');
    }
}

export class GetOnboardingSessionUseCase {
    constructor(
        @Inject(OnboardingSessionsRepository)
        private onboardingSessionsRepository: OnboardingSessionsRepository,
    ) { }

    async execute({ onboardingId }: GetOnboardingSessionRequest): Promise<GetOnboardingSessionResponse> {
        const onboardingSession = await this.onboardingSessionsRepository.findById(onboardingId);

        if (!onboardingSession) {
            throw new OnboardingSessionNotFoundError();
        }

        return { onboardingSession };
    }
}
