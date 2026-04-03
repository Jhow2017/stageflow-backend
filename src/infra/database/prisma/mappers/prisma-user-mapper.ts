import { User } from '../../../../domain/auth/enterprise/entities/user';
import { UniqueEntityID } from '../../../../core/entities/unique-entity-id';
import { User as PrismaUser } from '@prisma/client';
import { Role } from 'src/domain/auth/enterprise/value-objects/role';

export class PrismaUserMapper {
    static toDomain(raw: PrismaUser): User {
        return User.create(
            {
                name: raw.name,
                email: raw.email,
                password: raw.password,
                phone: raw.phone,
                document: raw.document,
                studioName: raw.studioName,
                studioSlug: raw.studioSlug,
                role: raw.role as Role,
                refreshToken: raw.refreshToken,
                resetPasswordToken: raw.resetPasswordToken,
                resetPasswordExpires: raw.resetPasswordExpires,
            },
            new UniqueEntityID(raw.id),
        );
    }

    static toPrisma(user: User): PrismaUser {
        return {
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            password: user.password,
            phone: user.phone,
            document: user.document,
            studioName: user.studioName,
            studioSlug: user.studioSlug,
            role: user.role,
            refreshToken: user.refreshToken,
            resetPasswordToken: user.resetPasswordToken,
            resetPasswordExpires: user.resetPasswordExpires,
            createdAt: user.createdAt,
            updatedAt: new Date(),
        };
    }
}