import { Inject, Injectable } from '@nestjs/common';
import { StudiosRepository } from '../../domain/booking/application/repositories/studios-repository';
import { SubdomainAvailabilityChecker } from '../../domain/onboarding/application/services/subdomain-availability-checker';

@Injectable()
export class StudioSubdomainAvailabilityChecker implements SubdomainAvailabilityChecker {
    constructor(
        @Inject(StudiosRepository)
        private studiosRepository: StudiosRepository,
    ) { }

    async isAvailable(subdomain: string): Promise<boolean> {
        const existingStudio = await this.studiosRepository.findBySlug(subdomain);
        return !existingStudio;
    }
}
