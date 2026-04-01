import { Entity } from '../../../../core/entities/entity';
import { UniqueEntityID } from '../../../../core/entities/unique-entity-id';

export interface ClientProps {
    studioId: string;
    userId: string | null;
    name: string;
    email: string;
    phone: string;
    bannerUrl: string | null;
    notes: string | null;
    createdAt: Date;
}

export class Client extends Entity<ClientProps> {
    get studioId(): string {
        return this.props.studioId;
    }

    get userId(): string | null {
        return this.props.userId;
    }

    get name(): string {
        return this.props.name;
    }

    get email(): string {
        return this.props.email;
    }

    get phone(): string {
        return this.props.phone;
    }

    get notes(): string | null {
        return this.props.notes;
    }

    get bannerUrl(): string | null {
        return this.props.bannerUrl;
    }

    updateProfile(data: { name: string; email: string; phone: string; notes?: string | null }): void {
        this.props.name = data.name;
        this.props.email = data.email;
        this.props.phone = data.phone;
        this.props.notes = data.notes ?? null;
    }

    setBannerUrl(url: string | null): void {
        this.props.bannerUrl = url;
    }

    static create(props: Omit<ClientProps, 'createdAt'>, id?: UniqueEntityID): Client {
        return new Client(
            {
                ...props,
                userId: props.userId ?? null,
                bannerUrl: props.bannerUrl ?? null,
                notes: props.notes ?? null,
                createdAt: new Date(),
            },
            id,
        );
    }
}
