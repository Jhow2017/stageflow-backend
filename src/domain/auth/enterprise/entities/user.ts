import { Entity } from '../../../../core/entities/entity';
import { UniqueEntityID } from '../../../../core/entities/unique-entity-id';
import { Role } from '../value-objects/role';

export type MercadoPagoConnectionType = 'OAUTH' | 'MANUAL';

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
    mercadoPagoConnectionType: MercadoPagoConnectionType | null;
    mercadoPagoAccessToken: string | null;
    mercadoPagoPublicKey: string | null;
    mercadoPagoUserId: string | null;
    mercadoPagoRefreshToken: string | null;
    mercadoPagoTokenExpiresAt: Date | null;
    mercadoPagoConnectedAt: Date | null;
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

    get mercadoPagoConnectionType(): MercadoPagoConnectionType | null {
        return this.props.mercadoPagoConnectionType;
    }

    get mercadoPagoAccessToken(): string | null {
        return this.props.mercadoPagoAccessToken;
    }

    get mercadoPagoPublicKey(): string | null {
        return this.props.mercadoPagoPublicKey;
    }

    get mercadoPagoUserId(): string | null {
        return this.props.mercadoPagoUserId;
    }

    get mercadoPagoRefreshToken(): string | null {
        return this.props.mercadoPagoRefreshToken;
    }

    get mercadoPagoTokenExpiresAt(): Date | null {
        return this.props.mercadoPagoTokenExpiresAt;
    }

    get mercadoPagoConnectedAt(): Date | null {
        return this.props.mercadoPagoConnectedAt;
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

    setMercadoPagoManualCredentials(accessToken: string, publicKey: string): void {
        this.props.mercadoPagoConnectionType = 'MANUAL';
        this.props.mercadoPagoAccessToken = accessToken;
        this.props.mercadoPagoPublicKey = publicKey;
        this.props.mercadoPagoUserId = null;
        this.props.mercadoPagoRefreshToken = null;
        this.props.mercadoPagoTokenExpiresAt = null;
        this.props.mercadoPagoConnectedAt = new Date();
    }

    setMercadoPagoOAuthCredentials(input: {
        accessToken: string;
        publicKey: string;
        refreshToken: string;
        userId: string;
        tokenExpiresAt: Date;
    }): void {
        this.props.mercadoPagoConnectionType = 'OAUTH';
        this.props.mercadoPagoAccessToken = input.accessToken;
        this.props.mercadoPagoPublicKey = input.publicKey;
        this.props.mercadoPagoUserId = input.userId;
        this.props.mercadoPagoRefreshToken = input.refreshToken;
        this.props.mercadoPagoTokenExpiresAt = input.tokenExpiresAt;
        this.props.mercadoPagoConnectedAt = new Date();
    }

    clearMercadoPagoConnection(): void {
        this.props.mercadoPagoConnectionType = null;
        this.props.mercadoPagoAccessToken = null;
        this.props.mercadoPagoPublicKey = null;
        this.props.mercadoPagoUserId = null;
        this.props.mercadoPagoRefreshToken = null;
        this.props.mercadoPagoTokenExpiresAt = null;
        this.props.mercadoPagoConnectedAt = null;
    }

    updateMercadoPagoOAuthTokens(input: {
        accessToken: string;
        refreshToken: string;
        tokenExpiresAt: Date;
    }): void {
        this.props.mercadoPagoAccessToken = input.accessToken;
        this.props.mercadoPagoRefreshToken = input.refreshToken;
        this.props.mercadoPagoTokenExpiresAt = input.tokenExpiresAt;
    }

    static create(
        props: Omit<
            UserProps,
            | 'createdAt'
            | 'mercadoPagoConnectionType'
            | 'mercadoPagoAccessToken'
            | 'mercadoPagoPublicKey'
            | 'mercadoPagoUserId'
            | 'mercadoPagoRefreshToken'
            | 'mercadoPagoTokenExpiresAt'
            | 'mercadoPagoConnectedAt'
        > &
            Partial<
                Pick<
                    UserProps,
                    | 'mercadoPagoConnectionType'
                    | 'mercadoPagoAccessToken'
                    | 'mercadoPagoPublicKey'
                    | 'mercadoPagoUserId'
                    | 'mercadoPagoRefreshToken'
                    | 'mercadoPagoTokenExpiresAt'
                    | 'mercadoPagoConnectedAt'
                >
            >,
        id?: UniqueEntityID,
    ): User {
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
                mercadoPagoConnectionType: props.mercadoPagoConnectionType ?? null,
                mercadoPagoAccessToken: props.mercadoPagoAccessToken ?? null,
                mercadoPagoPublicKey: props.mercadoPagoPublicKey ?? null,
                mercadoPagoUserId: props.mercadoPagoUserId ?? null,
                mercadoPagoRefreshToken: props.mercadoPagoRefreshToken ?? null,
                mercadoPagoTokenExpiresAt: props.mercadoPagoTokenExpiresAt ?? null,
                mercadoPagoConnectedAt: props.mercadoPagoConnectedAt ?? null,
                role: props.role ?? Role.USER,
                createdAt: new Date(),
            },
            id,
        );
    }
}