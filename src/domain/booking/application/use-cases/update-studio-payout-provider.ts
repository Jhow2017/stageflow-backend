import { Inject } from '@nestjs/common';
import { UseCaseError } from '../../../../core/errors/use-case-error';
import { Role } from '../../../auth/enterprise/value-objects/role';
import { StudioPayoutProvider } from '../../enterprise/entities/studio';
import { StudiosRepository } from '../repositories/studios-repository';
import { StudioNotFoundError } from './create-public-booking';
import { ensureStudioAdminAccess } from './studio-admin-access';

export class StudioStripePayoutNotReadyError extends UseCaseError {
    constructor() {
        super('Stripe Connect must be fully enabled before choosing Stripe as payout provider');
    }
}

export interface UpdateStudioPayoutProviderRequest {
    studioId: string;
    payoutProvider: StudioPayoutProvider;
    requesterUserId: string;
    requesterRole: Role;
}

export class UpdateStudioPayoutProviderUseCase {
    constructor(
        @Inject(StudiosRepository)
        private studiosRepository: StudiosRepository,
    ) { }

    async execute(req: UpdateStudioPayoutProviderRequest): Promise<{ ok: true }> {
        const studio = await this.studiosRepository.findById(req.studioId);
        if (!studio) throw new StudioNotFoundError();

        ensureStudioAdminAccess(studio, req.requesterRole, req.requesterUserId);

        if (req.payoutProvider === 'STRIPE') {
            if (
                !studio.stripeConnectedAccountId
                || !studio.stripeChargesEnabled
                || !studio.stripePayoutsEnabled
            ) {
                throw new StudioStripePayoutNotReadyError();
            }
        }

        studio.setPayoutProvider(req.payoutProvider);
        await this.studiosRepository.update({
            id: studio.id.toString(),
            ownerUserId: studio.ownerUserId,
            payoutProvider: studio.payoutProvider,
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

        return { ok: true };
    }
}
