import { Inject } from '@nestjs/common';
import { StudioGlobalSummary, StudiosRepository } from '../repositories/studios-repository';

export interface ListGlobalStudiosResponse {
    studios: StudioGlobalSummary[];
}

export class ListGlobalStudiosUseCase {
    constructor(
        @Inject(StudiosRepository)
        private studiosRepository: StudiosRepository,
    ) { }

    async execute(): Promise<ListGlobalStudiosResponse> {
        const studios = await this.studiosRepository.findAllWithSummary();
        return { studios };
    }
}
