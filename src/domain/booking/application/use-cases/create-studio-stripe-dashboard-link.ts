import { Inject } from '@nestjs/common';
import { Role } from '../../../auth/enterprise/value-objects/role';
import { StudiosRepository } from '../repositories/studios-repository';
import { StripeConnectGateway } from '../services/stripe-connect-gateway';
import { StudioNotFoundError } from './create-public-booking';
import { ensureStudioAdminAccess } from './studio-admin-access';
import { UseCaseError } from '../../../../core/errors/use-case-error';

export interface CreateStudioStripeDashboardLinkRequest {
    studioId: string;
    requesterUserId: string;
    requesterRole: Role;
}

export interface CreateStudioStripeDashboardLinkResponse {
    url: string;
}

export class StudioStripeAccountNotConnectedError extends UseCaseError {
    constructor() {
        super('Studio does not have a connected Stripe account yet');
    }
}

export class CreateStudioStripeDashboardLinkUseCase {
    constructor(
        @Inject(StudiosRepository)
        private studiosRepository: StudiosRepository,
        @Inject(StripeConnectGateway)
        private stripeConnectGateway: StripeConnectGateway,
    ) { }

    async execute({
        studioId,
        requesterUserId,
        requesterRole,
    }: CreateStudioStripeDashboardLinkRequest): Promise<CreateStudioStripeDashboardLinkResponse> {
        const studio = await this.studiosRepository.findById(studioId);
        if (!studio) throw new StudioNotFoundError();
        ensureStudioAdminAccess(studio, requesterRole, requesterUserId);
        if (!studio.stripeConnectedAccountId) {
            throw new StudioStripeAccountNotConnectedError();
        }

        const url = await this.stripeConnectGateway.createDashboardLoginLink(studio.stripeConnectedAccountId);
        return { url };
    }
}
