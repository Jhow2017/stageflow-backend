export interface CreatePendingPreapprovalInput {
    checkoutId: string;
    ownerEmail: string;
    planLabel: string;
    amountReaisPerCycle: number;
    billingCycle: 'MONTHLY' | 'ANNUAL';
}

export interface CreateTransparentPaymentInput {
    checkoutId: string;
    ownerEmail: string;
    amountReais: number;
    paymentMethodId: string;
    payerIdentificationType: string;
    payerIdentificationNumber: string;
    description: string;
    token?: string;
    installments?: number;
    issuerId?: string;
}
