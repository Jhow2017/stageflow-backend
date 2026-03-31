import { Controller, Post, Body, HttpCode, HttpStatus, Inject, Req } from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthenticateUserUseCase } from '../../../domain/auth/application/use-cases/authenticate-user';
import { JwtEncrypter } from '../../../infra/cryptography/jwt-encrypter';
import { RefreshTokenGenerator } from '../../../domain/auth/application/cryptography/refresh-token-generator';
import { UsersRepository } from '../../../domain/auth/application/repositories/users-repository';
import { AuditLogger } from '../../../domain/auth/application/services/audit-logger';
import { Public } from '../../../infra/auth/public';
import { AuthenticateUserDto } from '../dtos/authenticate-user.dto';
import { ThrottleAuth } from '../decorators/throttle.decorator';

@ApiTags('Auth')
@Controller('/auth/signin')
export class AuthenticateController {
    constructor(
        private authenticateUser: AuthenticateUserUseCase,
        private jwtEncrypter: JwtEncrypter,
        @Inject(RefreshTokenGenerator) private refreshTokenGenerator: RefreshTokenGenerator,
        @Inject(UsersRepository) private usersRepository: UsersRepository,
        @Inject(AuditLogger) private auditLogger: AuditLogger,
    ) { }

    @Post()
    @Public()
    @ThrottleAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Autenticar usuário (Login)' })
    @ApiResponse({
        status: 200,
        description: 'Login realizado com sucesso',
        schema: {
            example: {
                accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                user: {
                    id: 'uuid-aqui',
                    name: 'João Silva',
                    email: 'joao@email.com',
                    role: 'USER',
                    createdAt: '2024-12-08T00:00:00.000Z',
                },
            },
        },
    })
    @ApiResponse({
        status: 400,
        description: 'Dados inválidos',
    })
    @ApiResponse({
        status: 401,
        description: 'Credenciais inválidas',
    })
    @ApiResponse({
        status: 404,
        description: 'Usuário não encontrado',
    })
    @ApiResponse({
        status: 429,
        description: 'Muitas tentativas. Limite de 5 tentativas por minuto excedido',
    })
    async handle(@Body() body: AuthenticateUserDto, @Req() req: Request) {
        const { email, password } = body;

        const { user } = await this.authenticateUser.execute({
            email,
            password,
        });

        const accessToken = await this.jwtEncrypter.encrypt({
            sub: user.id.toString(),
        });

        const refreshToken = await this.refreshTokenGenerator.generate(
            user.id.toString(),
        );

        user.setRefreshToken(refreshToken);
        await this.usersRepository.save(user);

        // Registrar log de auditoria
        const ipAddress = req.ip || req.socket.remoteAddress || null;
        const userAgent = req.get('user-agent') || null;

        await this.auditLogger.log({
            userId: user.id.toString(),
            action: 'LOGIN',
            entityType: 'User',
            entityId: user.id.toString(),
            metadata: {
                email: user.email,
            },
            ipAddress,
            userAgent,
        });

        return {
            accessToken,
            refreshToken,
            user: {
                id: user.id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
            },
        };
    }
}