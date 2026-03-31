import { Client } from '../../enterprise/entities/client';

export interface UpsertClientRequest {
    studioId: string;
    userId?: string | null;
    name: string;
    email: string;
    phone: string;
    notes?: string | null;
}

export abstract class ClientsRepository {
    abstract upsertByStudioAndEmail(data: UpsertClientRequest): Promise<Client>;
    abstract findByStudioId(studioId: string): Promise<Client[]>;
}
