import { Injectable } from '@nestjs/common';
import { OnboardingSessionsRepository } from '../../domain/onboarding/application/repositories/onboarding-sessions-repository';
import { OnboardingSession } from '../../domain/onboarding/enterprise/entities/onboarding-session';

@Injectable()
export class InMemoryOnboardingSessionsRepository implements OnboardingSessionsRepository {
    private sessions = new Map<string, OnboardingSession>();

    async create(session: OnboardingSession): Promise<void> {
        this.sessions.set(session.id.toString(), session);
    }

    async findById(id: string): Promise<OnboardingSession | null> {
        return this.sessions.get(id) ?? null;
    }

    async save(session: OnboardingSession): Promise<void> {
        this.sessions.set(session.id.toString(), session);
    }
}
