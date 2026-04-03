import { Inject, Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { HashGenerator } from '../../domain/auth/application/cryptography/hash-generator';
import { UsersRepository } from '../../domain/auth/application/repositories/users-repository';
import { User } from '../../domain/auth/enterprise/entities/user';
import { Role } from '../../domain/auth/enterprise/value-objects/role';
import { StudiosRepository } from '../../domain/booking/application/repositories/studios-repository';
import {
    SubscriptionProvisioningResult,
    SubscriptionProvisioningService,
} from '../../domain/subscription-checkout/application/services/subscription-provisioning-service';
import { SubscriptionCheckoutSession } from '../../domain/subscription-checkout/enterprise/entities/subscription-checkout-session';

@Injectable()
export class StudioSubscriptionProvisioningService implements SubscriptionProvisioningService {
    constructor(
        @Inject(StudiosRepository)
        private studiosRepository: StudiosRepository,
        @Inject(UsersRepository)
        private usersRepository: UsersRepository,
        @Inject(HashGenerator)
        private hashGenerator: HashGenerator,
    ) { }

    async provisionFromCheckout(session: SubscriptionCheckoutSession): Promise<SubscriptionProvisioningResult> {
        const existingUser = await this.usersRepository.findByEmail(session.ownerEmail);

        let subscriberUserId: string;
        if (existingUser) {
            subscriberUserId = existingUser.id.toString();
        } else {
            const temporaryPassword = randomBytes(16).toString('hex');
            const hashedPassword = await this.hashGenerator.hash(temporaryPassword);

            const subscriber = User.create({
                name: session.ownerName,
                email: session.ownerEmail,
                password: hashedPassword,
                phone: null,
                document: null,
                studioName: null,
                studioSlug: null,
                role: Role.USER,
                refreshToken: null,
                resetPasswordToken: null,
                resetPasswordExpires: null,
            });

            await this.usersRepository.create(subscriber);
            subscriberUserId = subscriber.id.toString();
        }

        const studio = await this.studiosRepository.create({
            ownerUserId: subscriberUserId,
            name: session.studioName,
            slug: session.subdomain ?? `studio-${session.id.toString().slice(0, 8)}`,
            planTier: session.planTier,
            openHour: 8,
            closeHour: 22,
            timezone: 'America/Sao_Paulo',
        });

        return {
            studioId: studio.id.toString(),
            subscriberUserId,
        };
    }
}
