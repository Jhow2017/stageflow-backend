import { Entity } from '../../../../core/entities/entity';
import { UniqueEntityID } from '../../../../core/entities/unique-entity-id';

export interface StudioProps {
    ownerUserId: string | null;
    stripeConnectedAccountId: string | null;
    stripeOnboardingComplete: boolean;
    stripeChargesEnabled: boolean;
    stripePayoutsEnabled: boolean;
    stripeDetailsSubmitted: boolean;
    stripeRequirementsCurrentlyDue: string[] | null;
    stripeRequirementsEventuallyDue: string[] | null;
    stripeConnectStatus: string | null;
    name: string;
    slug: string;
    planTier: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
    logoUrl: string | null;
    primaryColor: string | null;
    openHour: number;
    closeHour: number;
    timezone: string;
    createdAt: Date;
    updatedAt: Date;
}

export class Studio extends Entity<StudioProps> {
    get ownerUserId(): string | null {
        return this.props.ownerUserId;
    }

    get name(): string {
        return this.props.name;
    }

    get stripeConnectedAccountId(): string | null {
        return this.props.stripeConnectedAccountId;
    }

    get stripeOnboardingComplete(): boolean {
        return this.props.stripeOnboardingComplete;
    }

    get stripeChargesEnabled(): boolean {
        return this.props.stripeChargesEnabled;
    }

    get stripePayoutsEnabled(): boolean {
        return this.props.stripePayoutsEnabled;
    }

    get stripeDetailsSubmitted(): boolean {
        return this.props.stripeDetailsSubmitted;
    }

    get stripeRequirementsCurrentlyDue(): string[] | null {
        return this.props.stripeRequirementsCurrentlyDue;
    }

    get stripeRequirementsEventuallyDue(): string[] | null {
        return this.props.stripeRequirementsEventuallyDue;
    }

    get stripeConnectStatus(): string | null {
        return this.props.stripeConnectStatus;
    }

    get slug(): string {
        return this.props.slug;
    }

    get planTier(): 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE' {
        return this.props.planTier;
    }

    get logoUrl(): string | null {
        return this.props.logoUrl;
    }

    get primaryColor(): string | null {
        return this.props.primaryColor;
    }

    get openHour(): number {
        return this.props.openHour;
    }

    get closeHour(): number {
        return this.props.closeHour;
    }

    get timezone(): string {
        return this.props.timezone;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    get updatedAt(): Date {
        return this.props.updatedAt;
    }

    update(data: {
        ownerUserId: string | null;
        stripeConnectedAccountId: string | null;
        stripeOnboardingComplete: boolean;
        stripeChargesEnabled: boolean;
        stripePayoutsEnabled: boolean;
        stripeDetailsSubmitted: boolean;
        stripeRequirementsCurrentlyDue: string[] | null;
        stripeRequirementsEventuallyDue: string[] | null;
        stripeConnectStatus: string | null;
        name: string;
        slug: string;
        planTier: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
        logoUrl: string | null;
        primaryColor: string | null;
        openHour: number;
        closeHour: number;
        timezone: string;
    }): void {
        this.props.ownerUserId = data.ownerUserId;
        this.props.stripeConnectedAccountId = data.stripeConnectedAccountId;
        this.props.stripeOnboardingComplete = data.stripeOnboardingComplete;
        this.props.stripeChargesEnabled = data.stripeChargesEnabled;
        this.props.stripePayoutsEnabled = data.stripePayoutsEnabled;
        this.props.stripeDetailsSubmitted = data.stripeDetailsSubmitted;
        this.props.stripeRequirementsCurrentlyDue = data.stripeRequirementsCurrentlyDue;
        this.props.stripeRequirementsEventuallyDue = data.stripeRequirementsEventuallyDue;
        this.props.stripeConnectStatus = data.stripeConnectStatus;
        this.props.name = data.name;
        this.props.slug = data.slug;
        this.props.planTier = data.planTier;
        this.props.logoUrl = data.logoUrl;
        this.props.primaryColor = data.primaryColor;
        this.props.openHour = data.openHour;
        this.props.closeHour = data.closeHour;
        this.props.timezone = data.timezone;
        this.props.updatedAt = new Date();
    }

    linkStripeAccount(accountId: string): void {
        this.props.stripeConnectedAccountId = accountId;
        this.props.updatedAt = new Date();
    }

    updateStripeCapabilities(data: {
        onboardingComplete: boolean;
        chargesEnabled: boolean;
        payoutsEnabled: boolean;
        detailsSubmitted: boolean;
        requirementsCurrentlyDue: string[];
        requirementsEventuallyDue: string[];
        connectStatus: string;
    }): void {
        this.props.stripeOnboardingComplete = data.onboardingComplete;
        this.props.stripeChargesEnabled = data.chargesEnabled;
        this.props.stripePayoutsEnabled = data.payoutsEnabled;
        this.props.stripeDetailsSubmitted = data.detailsSubmitted;
        this.props.stripeRequirementsCurrentlyDue = data.requirementsCurrentlyDue;
        this.props.stripeRequirementsEventuallyDue = data.requirementsEventuallyDue;
        this.props.stripeConnectStatus = data.connectStatus;
        this.props.updatedAt = new Date();
    }

    static create(
        props: Omit<
            StudioProps,
            | 'createdAt'
            | 'updatedAt'
            | 'stripeConnectedAccountId'
            | 'stripeOnboardingComplete'
            | 'stripeChargesEnabled'
            | 'stripePayoutsEnabled'
            | 'stripeDetailsSubmitted'
            | 'stripeRequirementsCurrentlyDue'
            | 'stripeRequirementsEventuallyDue'
            | 'stripeConnectStatus'
        > & {
            stripeConnectedAccountId?: string | null;
            stripeOnboardingComplete?: boolean;
            stripeChargesEnabled?: boolean;
            stripePayoutsEnabled?: boolean;
            stripeDetailsSubmitted?: boolean;
            stripeRequirementsCurrentlyDue?: string[] | null;
            stripeRequirementsEventuallyDue?: string[] | null;
            stripeConnectStatus?: string | null;
            createdAt?: Date;
            updatedAt?: Date;
        },
        id?: UniqueEntityID,
    ): Studio {
        return new Studio(
            {
                ...props,
                stripeConnectedAccountId: props.stripeConnectedAccountId ?? null,
                stripeOnboardingComplete: props.stripeOnboardingComplete ?? false,
                stripeChargesEnabled: props.stripeChargesEnabled ?? false,
                stripePayoutsEnabled: props.stripePayoutsEnabled ?? false,
                stripeDetailsSubmitted: props.stripeDetailsSubmitted ?? false,
                stripeRequirementsCurrentlyDue: props.stripeRequirementsCurrentlyDue ?? null,
                stripeRequirementsEventuallyDue: props.stripeRequirementsEventuallyDue ?? null,
                stripeConnectStatus: props.stripeConnectStatus ?? null,
                planTier: props.planTier ?? 'STARTER',
                timezone: props.timezone ?? 'America/Sao_Paulo',
                createdAt: props.createdAt ?? new Date(),
                updatedAt: props.updatedAt ?? new Date(),
            },
            id,
        );
    }
}
