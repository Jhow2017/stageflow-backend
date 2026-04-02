export interface StripeConnectedAccountSnapshot {
    accountId: string;
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
    detailsSubmitted: boolean;
    requirementsCurrentlyDue: string[];
    requirementsEventuallyDue: string[];
    connectStatus: 'PENDING' | 'RESTRICTED' | 'ACTIVE';
}

export interface CreateStripeConnectOnboardingLinkRequest {
    accountId?: string | null;
    email: string;
    businessName: string;
    metadata: Record<string, string>;
}

export interface CreateStripeConnectOnboardingLinkResponse {
    accountId: string;
    onboardingUrl: string;
}

export abstract class StripeConnectGateway {
    abstract createOnboardingLink(
        data: CreateStripeConnectOnboardingLinkRequest,
    ): Promise<CreateStripeConnectOnboardingLinkResponse>;

    abstract createDashboardLoginLink(accountId: string): Promise<string>;

    abstract retrieveAccountSnapshot(accountId: string): Promise<StripeConnectedAccountSnapshot>;
}
