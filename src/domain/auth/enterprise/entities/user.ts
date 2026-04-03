import { Entity } from '../../../../core/entities/entity';
import { UniqueEntityID } from '../../../../core/entities/unique-entity-id';
import { Role } from '../value-objects/role';

export interface UserProps {
    name: string;
    email: string;
    password: string;
    phone: string | null;
    document: string | null;
    studioName: string | null;
    studioSlug: string | null;
    role: Role;
    refreshToken: string | null;
    resetPasswordToken: string | null;
    resetPasswordExpires: Date | null;
    createdAt: Date;
}

export class User extends Entity<UserProps> {
    get name(): string {
        return this.props.name;
    }

    get email(): string {
        return this.props.email;
    }

    get password(): string {
        return this.props.password;
    }

    get phone(): string | null {
        return this.props.phone;
    }

    get document(): string | null {
        return this.props.document;
    }

    get studioName(): string | null {
        return this.props.studioName;
    }

    get studioSlug(): string | null {
        return this.props.studioSlug;
    }

    get role(): Role {
        return this.props.role;
    }

    get createdAt(): Date {
        return this.props.createdAt;
    }

    get refreshToken(): string | null {
        return this.props.refreshToken;
    }

    get resetPasswordToken(): string | null {
        return this.props.resetPasswordToken;
    }

    get resetPasswordExpires(): Date | null {
        return this.props.resetPasswordExpires;
    }

    setRefreshToken(refreshToken: string | null): void {
        this.props.refreshToken = refreshToken;
    }

    setResetPasswordToken(token: string | null, expiresAt: Date | null): void {
        this.props.resetPasswordToken = token;
        this.props.resetPasswordExpires = expiresAt;
    }

    setResetPasswordExpires(resetPasswordExpires: Date | null): void {
        this.props.resetPasswordExpires = resetPasswordExpires;
    }

    setRole(role: Role): void {
        this.props.role = role;
    }

    setPassword(password: string): void {
        this.props.password = password;
    }

    static create(props: Omit<UserProps, 'createdAt'>, id?: UniqueEntityID): User {
        return new User(
            {
                ...props,
                phone: props.phone ?? null,
                document: props.document ?? null,
                studioName: props.studioName ?? null,
                studioSlug: props.studioSlug ?? null,
                refreshToken: props.refreshToken ?? null,
                resetPasswordToken: props.resetPasswordToken ?? null,
                resetPasswordExpires: props.resetPasswordExpires ?? null,
                role: props.role ?? Role.USER,
                createdAt: new Date(),
            },
            id,
        );
    }
}