import { OnboardingSession } from '../../enterprise/entities/onboarding-session';

export interface StudioProvisioningResult {
    studioId: string;
    ownerUserId: string;
}

export abstract class StudioProvisioningService {
    abstract provisionFromOnboarding(session: OnboardingSession): Promise<StudioProvisioningResult>;
}
