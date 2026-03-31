import { Role } from '../../../auth/enterprise/value-objects/role';
import { UseCaseError } from '../../../../core/errors/use-case-error';
import { Studio } from '../../enterprise/entities/studio';

export class StudioAccessDeniedError extends UseCaseError {
    constructor() {
        super('You do not have permission to access this studio');
    }
}

export function ensureStudioAdminAccess(
    studio: Studio,
    requesterRole: Role,
    requesterUserId: string,
): void {
    // OWNER is platform-level and can access all studios.
    if (requesterRole === Role.OWNER) {
        return;
    }

    if (studio.ownerUserId === requesterUserId) {
        return;
    }

    throw new StudioAccessDeniedError();
}
