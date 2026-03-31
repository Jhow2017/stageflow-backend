import { Entity } from '../../../../core/entities/entity';
import { UniqueEntityID } from '../../../../core/entities/unique-entity-id';

export interface StudioProps {
    name: string;
    slug: string;
    logoUrl: string | null;
    primaryColor: string | null;
    openHour: number;
    closeHour: number;
    timezone: string;
    createdAt: Date;
    updatedAt: Date;
}

export class Studio extends Entity<StudioProps> {
    get name(): string {
        return this.props.name;
    }

    get slug(): string {
        return this.props.slug;
    }

    get logoUrl(): string | null {
        return this.props.logoUrl;
    }

    get primaryColor(): string | null {
        return this.props.primaryColor;
    }

    get openHour(): number {
        return this.props.openHour;
    }

    get closeHour(): number {
        return this.props.closeHour;
    }

    get timezone(): string {
        return this.props.timezone;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    get updatedAt(): Date {
        return this.props.updatedAt;
    }

    update(data: {
        name: string;
        slug: string;
        logoUrl: string | null;
        primaryColor: string | null;
        openHour: number;
        closeHour: number;
        timezone: string;
    }): void {
        this.props.name = data.name;
        this.props.slug = data.slug;
        this.props.logoUrl = data.logoUrl;
        this.props.primaryColor = data.primaryColor;
        this.props.openHour = data.openHour;
        this.props.closeHour = data.closeHour;
        this.props.timezone = data.timezone;
        this.props.updatedAt = new Date();
    }

    static create(
        props: Omit<StudioProps, 'createdAt' | 'updatedAt'> & {
            createdAt?: Date;
            updatedAt?: Date;
        },
        id?: UniqueEntityID,
    ): Studio {
        return new Studio(
            {
                ...props,
                timezone: props.timezone ?? 'America/Sao_Paulo',
                createdAt: props.createdAt ?? new Date(),
                updatedAt: props.updatedAt ?? new Date(),
            },
            id,
        );
    }
}
