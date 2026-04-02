import { Inject } from '@nestjs/common';
import { Role } from '../../../auth/enterprise/value-objects/role';
import { StudiosRepository } from '../repositories/studios-repository';
import { StripeConnectGateway } from '../services/stripe-connect-gateway';
import { StudioNotFoundError } from './create-public-booking';
import { ensureStudioAdminAccess } from './studio-admin-access';

export interface CreateStudioStripeConnectOnboardingLinkRequest {
    studioId: string;
    requesterUserId: string;
    requesterRole: Role;
}

export interface CreateStudioStripeConnectOnboardingLinkResponse {
    accountId: string;
    onboardingUrl: string;
}

export class CreateStudioStripeConnectOnboardingLinkUseCase {
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
    }: CreateStudioStripeConnectOnboardingLinkRequest): Promise<CreateStudioStripeConnectOnboardingLinkResponse> {
        const studio = await this.studiosRepository.findById(studioId);
        if (!studio) throw new StudioNotFoundError();

        ensureStudioAdminAccess(studio, requesterRole, requesterUserId);

        const result = await this.stripeConnectGateway.createOnboardingLink({
            accountId: studio.stripeConnectedAccountId,
            email: `finance+${studio.id.toString()}@stageflow.app`,
            businessName: studio.name,
            metadata: {
                studioId: studio.id.toString(),
                studioSlug: studio.slug,
            },
        });

        if (!studio.stripeConnectedAccountId) {
            studio.linkStripeAccount(result.accountId);
        }
        const snapshot = await this.stripeConnectGateway.retrieveAccountSnapshot(result.accountId);
        studio.updateStripeCapabilities({
            onboardingComplete: snapshot.chargesEnabled && snapshot.payoutsEnabled,
            chargesEnabled: snapshot.chargesEnabled,
            payoutsEnabled: snapshot.payoutsEnabled,
            detailsSubmitted: snapshot.detailsSubmitted,
            requirementsCurrentlyDue: snapshot.requirementsCurrentlyDue,
            requirementsEventuallyDue: snapshot.requirementsEventuallyDue,
            connectStatus: snapshot.connectStatus,
        });

        await this.studiosRepository.update({
            id: studio.id.toString(),
            ownerUserId: studio.ownerUserId,
            stripeConnectedAccountId: studio.stripeConnectedAccountId,
            stripeOnboardingComplete: studio.stripeOnboardingComplete,
            stripeChargesEnabled: studio.stripeChargesEnabled,
            stripePayoutsEnabled: studio.stripePayoutsEnabled,
            stripeDetailsSubmitted: studio.stripeDetailsSubmitted,
            stripeRequirementsCurrentlyDue: studio.stripeRequirementsCurrentlyDue,
            stripeRequirementsEventuallyDue: studio.stripeRequirementsEventuallyDue,
            stripeConnectStatus: studio.stripeConnectStatus,
            name: studio.name,
            slug: studio.slug,
            planTier: studio.planTier,
            logoUrl: studio.logoUrl,
            primaryColor: studio.primaryColor,
            openHour: studio.openHour,
            closeHour: studio.closeHour,
            timezone: studio.timezone,
        });

        return result;
    }
}
