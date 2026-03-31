import { Inject, Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { HashGenerator } from '../../domain/auth/application/cryptography/hash-generator';
import { UsersRepository } from '../../domain/auth/application/repositories/users-repository';
import { User } from '../../domain/auth/enterprise/entities/user';
import { Role } from '../../domain/auth/enterprise/value-objects/role';
import { StudiosRepository } from '../../domain/booking/application/repositories/studios-repository';
import {
    StudioProvisioningResult,
    StudioProvisioningService,
} from '../../domain/onboarding/application/services/studio-provisioning-service';
import { OnboardingSession } from '../../domain/onboarding/enterprise/entities/onboarding-session';

@Injectable()
export class StudioOnboardingProvisioningService implements StudioProvisioningService {
    constructor(
        @Inject(StudiosRepository)
        private studiosRepository: StudiosRepository,
        @Inject(UsersRepository)
        private usersRepository: UsersRepository,
        @Inject(HashGenerator)
        private hashGenerator: HashGenerator,
    ) { }

    async provisionFromOnboarding(session: OnboardingSession): Promise<StudioProvisioningResult> {
        const existingUser = await this.usersRepository.findByEmail(session.ownerEmail);

        let ownerUserId: string;
        if (existingUser) {
            ownerUserId = existingUser.id.toString();
        } else {
            const temporaryPassword = randomBytes(16).toString('hex');
            const hashedPassword = await this.hashGenerator.hash(temporaryPassword);

            const owner = User.create({
                name: session.ownerName,
                email: session.ownerEmail,
                password: hashedPassword,
                role: Role.USER,
                refreshToken: null,
                resetPasswordToken: null,
                resetPasswordExpires: null,
            });

            await this.usersRepository.create(owner);
            ownerUserId = owner.id.toString();
        }

        const studio = await this.studiosRepository.create({
            ownerUserId,
            name: session.studioName,
            slug: session.subdomain ?? `studio-${session.id.toString().slice(0, 8)}`,
            planTier: session.planTier,
            openHour: 8,
            closeHour: 22,
            timezone: 'America/Sao_Paulo',
        });

        return {
            studioId: studio.id.toString(),
            ownerUserId,
        };
    }
}
