import { Entity } from '../../../../core/entities/entity';
import { UniqueEntityID } from '../../../../core/entities/unique-entity-id';

export type PlanTier = 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
export type BillingCycle = 'MONTHLY' | 'ANNUAL';
export type DomainType = 'SUBDOMAIN' | 'CUSTOM_DOMAIN';
export type PaymentMethod = 'CARD' | 'PIX' | 'BOLETO';
export type OnboardingStatus = 'DRAFT' | 'PENDING_PAYMENT' | 'ACTIVE' | 'FAILED';

export interface OnboardingSessionProps {
    planTier: PlanTier;
    billingCycle: BillingCycle;
    studioName: string;
    ownerName: string;
    ownerEmail: string;
    ownerPhone: string;
    ownerDocument: string;
    domainType: DomainType;
    subdomain: string | null;
    customDomain: string | null;
    paymentMethod: PaymentMethod;
    totalAmount: number;
    status: OnboardingStatus;
    studioId: string | null;
    ownerUserId: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export class OnboardingSession extends Entity<OnboardingSessionProps> {
    get planTier(): PlanTier { return this.props.planTier; }
    get billingCycle(): BillingCycle { return this.props.billingCycle; }
    get studioName(): string { return this.props.studioName; }
    get ownerName(): string { return this.props.ownerName; }
    get ownerEmail(): string { return this.props.ownerEmail; }
    get ownerPhone(): string { return this.props.ownerPhone; }
    get ownerDocument(): string { return this.props.ownerDocument; }
    get domainType(): DomainType { return this.props.domainType; }
    get subdomain(): string | null { return this.props.subdomain; }
    get customDomain(): string | null { return this.props.customDomain; }
    get paymentMethod(): PaymentMethod { return this.props.paymentMethod; }
    get totalAmount(): number { return this.props.totalAmount; }
    get status(): OnboardingStatus { return this.props.status; }
    get studioId(): string | null { return this.props.studioId; }
    get ownerUserId(): string | null { return this.props.ownerUserId; }
    get createdAt(): Date { return this.props.createdAt; }
    get updatedAt(): Date { return this.props.updatedAt; }

    setStatus(status: OnboardingStatus): void {
        this.props.status = status;
        this.props.updatedAt = new Date();
    }

    setProvisioningResult(studioId: string, ownerUserId: string): void {
        this.props.studioId = studioId;
        this.props.ownerUserId = ownerUserId;
        this.props.status = 'ACTIVE';
        this.props.updatedAt = new Date();
    }

    static create(
        props: Omit<OnboardingSessionProps, 'createdAt' | 'updatedAt'> & {
            createdAt?: Date;
            updatedAt?: Date;
        },
        id?: UniqueEntityID,
    ): OnboardingSession {
        return new OnboardingSession(
            {
                ...props,
                createdAt: props.createdAt ?? new Date(),
                updatedAt: props.updatedAt ?? new Date(),
            },
            id,
        );
    }
}
