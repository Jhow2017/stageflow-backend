import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { ClientsRepository } from '../../domain/booking/application/repositories/clients-repository';
import { StudiosRepository } from '../../domain/booking/application/repositories/studios-repository';
import { User } from '../../domain/auth/enterprise/entities/user';

@Injectable()
export class ClientAreaScopeGuard implements CanActivate {
    constructor(
        @Inject(StudiosRepository)
        private studiosRepository: StudiosRepository,
        @Inject(ClientsRepository)
        private clientsRepository: ClientsRepository,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user as User | undefined;
        const studioSlug = String(request.params.studioSlug ?? '');

        if (!user) {
            throw new ForbiddenException('User not authenticated');
        }

        const studio = await this.studiosRepository.findBySlug(studioSlug);
        if (!studio) {
            throw new ForbiddenException('Client is not linked to this studio');
        }

        const client = await this.clientsRepository.findByStudioAndUserId(
            studio.id.toString(),
            user.id.toString(),
        );

        if (!client) {
            throw new ForbiddenException('Client is not linked to this studio');
        }

        return true;
    }
}
