import { Entity } from '../../../../core/entities/entity';
import { UniqueEntityID } from '../../../../core/entities/unique-entity-id';

export interface RoomProps {
    studioId: string;
    name: string;
    type: string;
    description: string;
    pricePerHour: number;
    capacity: number;
    features: string[];
    imageUrl: string | null;
    rating: number | null;
    reviewCount: number | null;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export class Room extends Entity<RoomProps> {
    get studioId(): string {
        return this.props.studioId;
    }

    get name(): string {
        return this.props.name;
    }

    get type(): string {
        return this.props.type;
    }

    get description(): string {
        return this.props.description;
    }

    get pricePerHour(): number {
        return this.props.pricePerHour;
    }

    get capacity(): number {
        return this.props.capacity;
    }

    get features(): string[] {
        return this.props.features;
    }

    get imageUrl(): string | null {
        return this.props.imageUrl;
    }

    get rating(): number | null {
        return this.props.rating;
    }

    get reviewCount(): number | null {
        return this.props.reviewCount;
    }

    get active(): boolean {
        return this.props.active;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    get updatedAt(): Date {
        return this.props.updatedAt;
    }

    update(data: {
        name: string;
        type: string;
        description: string;
        pricePerHour: number;
        capacity: number;
        features: string[];
        imageUrl: string | null;
        rating: number | null;
        reviewCount: number | null;
        active: boolean;
    }): void {
        this.props.name = data.name;
        this.props.type = data.type;
        this.props.description = data.description;
        this.props.pricePerHour = data.pricePerHour;
        this.props.capacity = data.capacity;
        this.props.features = data.features;
        this.props.imageUrl = data.imageUrl;
        this.props.rating = data.rating;
        this.props.reviewCount = data.reviewCount;
        this.props.active = data.active;
        this.props.updatedAt = new Date();
    }

    static create(
        props: Omit<RoomProps, 'createdAt' | 'updatedAt'> & {
            createdAt?: Date;
            updatedAt?: Date;
        },
        id?: UniqueEntityID,
    ): Room {
        return new Room(
            {
                ...props,
                createdAt: props.createdAt ?? new Date(),
                updatedAt: props.updatedAt ?? new Date(),
            },
            id,
        );
    }
}
