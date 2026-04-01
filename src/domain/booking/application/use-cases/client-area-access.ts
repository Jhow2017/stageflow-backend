import { UseCaseError } from '../../../../core/errors/use-case-error';
import { Client } from '../../enterprise/entities/client';

export class ClientAreaAccessDeniedError extends UseCaseError {
    constructor() {
        super('You do not have permission to access this client area');
    }
}

export function ensureClientAreaAccess(client: Client | null): asserts client is Client {
    if (!client) {
        throw new ClientAreaAccessDeniedError();
    }
}
