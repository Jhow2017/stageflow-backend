import { Inject } from '@nestjs/common';
import { UseCaseError } from '../../../../core/errors/use-case-error';
import { StudioGlobalSummary, StudiosRepository } from '../repositories/studios-repository';

export interface GetGlobalStudioDetailsRequest {
    studioId: string;
}

export interface GetGlobalStudioDetailsResponse {
    studio: StudioGlobalSummary;
}

export class StudioNotFoundError extends UseCaseError {
    constructor() {
        super('Studio not found');
    }
}

export class GetGlobalStudioDetailsUseCase {
    constructor(
        @Inject(StudiosRepository)
        private studiosRepository: StudiosRepository,
    ) { }

    async execute({ studioId }: GetGlobalStudioDetailsRequest): Promise<GetGlobalStudioDetailsResponse> {
        const studio = await this.studiosRepository.findByIdWithSummary(studioId);

        if (!studio) {
            throw new StudioNotFoundError();
        }

        return { studio };
    }
}
