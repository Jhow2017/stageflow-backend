import { Inject } from '@nestjs/common';
import { Role } from '../../../auth/enterprise/value-objects/role';
import { StudiosRepository } from '../repositories/studios-repository';
import { StripeConnectGateway } from '../services/stripe-connect-gateway';
import { StudioNotFoundError } from './create-public-booking';
import { ensureStudioAdminAccess } from './studio-admin-access';

export interface GetStudioStripeConnectStatusRequest {
    studioId: string;
    requesterUserId: string;
    requesterRole: Role;
    refreshFromStripe?: boolean;
}

export interface GetStudioStripeConnectStatusResponse {
    accountId: string | null;
    onboardingComplete: boolean;
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
    detailsSubmitted: boolean;
    requirementsCurrentlyDue: string[];
    requirementsEventuallyDue: string[];
    connectStatus: string | null;
}

export class GetStudioStripeConnectStatusUseCase {
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
        refreshFromStripe = false,
    }: GetStudioStripeConnectStatusRequest): Promise<GetStudioStripeConnectStatusResponse> {
        const studio = await this.studiosRepository.findById(studioId);
        if (!studio) throw new StudioNotFoundError();
        ensureStudioAdminAccess(studio, requesterRole, requesterUserId);

        if (refreshFromStripe && studio.stripeConnectedAccountId) {
            const snapshot = await this.stripeConnectGateway.retrieveAccountSnapshot(studio.stripeConnectedAccountId);
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
        }

        return {
            accountId: studio.stripeConnectedAccountId,
            onboardingComplete: studio.stripeOnboardingComplete,
            chargesEnabled: studio.stripeChargesEnabled,
            payoutsEnabled: studio.stripePayoutsEnabled,
            detailsSubmitted: studio.stripeDetailsSubmitted,
            requirementsCurrentlyDue: studio.stripeRequirementsCurrentlyDue ?? [],
            requirementsEventuallyDue: studio.stripeRequirementsEventuallyDue ?? [],
            connectStatus: studio.stripeConnectStatus,
        };
    }
}
