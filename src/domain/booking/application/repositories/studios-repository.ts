import { Studio } from '../../enterprise/entities/studio';

export interface CreateStudioRequest {
    ownerUserId?: string | null;
    stripeConnectedAccountId?: string | null;
    stripeOnboardingComplete?: boolean;
    stripeChargesEnabled?: boolean;
    stripePayoutsEnabled?: boolean;
    stripeDetailsSubmitted?: boolean;
    stripeRequirementsCurrentlyDue?: string[] | null;
    stripeRequirementsEventuallyDue?: string[] | null;
    stripeConnectStatus?: string | null;
    name: string;
    slug: string;
    planTier: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
    logoUrl?: string | null;
    primaryColor?: string | null;
    openHour: number;
    closeHour: number;
    timezone?: string;
}

export interface UpdateStudioRequest extends CreateStudioRequest {
    id: string;
}

export interface StudioGlobalSummary {
    studio: Studio;
    roomsCount: number;
    bookingsCount: number;
    clientsCount: number;
    status: 'PENDING_SETUP' | 'ACTIVE';
}

export abstract class StudiosRepository {
    abstract findBySlug(slug: string): Promise<Studio | null>;
    abstract findById(id: string): Promise<Studio | null>;
    abstract findByStripeConnectedAccountId(accountId: string): Promise<Studio | null>;
    abstract create(data: CreateStudioRequest): Promise<Studio>;
    abstract update(data: UpdateStudioRequest): Promise<Studio>;
    abstract findAll(): Promise<Studio[]>;
    abstract findAllWithSummary(): Promise<StudioGlobalSummary[]>;
    abstract findByIdWithSummary(id: string): Promise<StudioGlobalSummary | null>;
}
