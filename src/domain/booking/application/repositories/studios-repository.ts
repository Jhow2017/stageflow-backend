import { Studio } from '../../enterprise/entities/studio';

export interface CreateStudioRequest {
    name: string;
    slug: string;
    logoUrl?: string | null;
    primaryColor?: string | null;
    openHour: number;
    closeHour: number;
    timezone?: string;
}

export interface UpdateStudioRequest extends CreateStudioRequest {
    id: string;
}

export abstract class StudiosRepository {
    abstract findBySlug(slug: string): Promise<Studio | null>;
    abstract findById(id: string): Promise<Studio | null>;
    abstract create(data: CreateStudioRequest): Promise<Studio>;
    abstract update(data: UpdateStudioRequest): Promise<Studio>;
    abstract findAll(): Promise<Studio[]>;
}
