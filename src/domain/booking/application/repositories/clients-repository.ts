import { Client } from '../../enterprise/entities/client';

export interface UpsertClientRequest {
    studioId: string;
    userId?: string | null;
    name: string;
    email: string;
    phone: string;
    bannerUrl?: string | null;
    notes?: string | null;
}

export abstract class ClientsRepository {
    abstract upsertByStudioAndEmail(data: UpsertClientRequest): Promise<Client>;
    abstract findByStudioId(studioId: string): Promise<Client[]>;
    abstract findByStudioAndUserId(studioId: string, userId: string): Promise<Client | null>;
    abstract save(client: Client): Promise<void>;
    abstract deleteById(clientId: string): Promise<void>;
}
