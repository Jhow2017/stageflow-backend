import { OnboardingSession } from '../../enterprise/entities/onboarding-session';

export abstract class OnboardingSessionsRepository {
    abstract create(session: OnboardingSession): Promise<void>;
    abstract findById(id: string): Promise<OnboardingSession | null>;
    abstract save(session: OnboardingSession): Promise<void>;
}
