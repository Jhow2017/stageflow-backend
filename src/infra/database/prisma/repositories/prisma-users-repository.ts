import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UsersRepository } from '../../../../domain/auth/application/repositories/users-repository';
import { User } from '../../../../domain/auth/enterprise/entities/user';
import { PrismaUserMapper } from '../mappers/prisma-user-mapper';

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
    constructor(private prisma: PrismaService) { }

    async findByEmail(email: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (!user) {
            return null;
        }

        return PrismaUserMapper.toDomain(user);
    }

    async findById(id: string): Promise<User | null> {
        const user = await this.prisma.user.findUnique({
            where: {
                id,
            },
        });

        if (!user) {
            return null;
        }

        return PrismaUserMapper.toDomain(user);
    }

    async findByMercadoPagoUserId(mercadoPagoUserId: string): Promise<User | null> {
        const user = await this.prisma.user.findFirst({
            where: { mercadoPagoUserId },
        });
        if (!user) return null;
        return PrismaUserMapper.toDomain(user);
    }

    async create(user: User): Promise<void> {
        const data = PrismaUserMapper.toPrisma(user);

        await this.prisma.user.create({
            data,
        });
    }

    async save(user: User): Promise<void> {
        const data = PrismaUserMapper.toPrisma(user);

        await this.prisma.user.update({
            where: {
                id: user.id.toString(),
            },
            data,
        });
    }

    async findAll(): Promise<User[]> {
        const users = await this.prisma.user.findMany({
            orderBy: {
                createdAt: 'desc',
            },
        });

        return users.map(PrismaUserMapper.toDomain);
    }
}