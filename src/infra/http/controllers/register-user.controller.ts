import { Controller, Post, Body, HttpCode, HttpStatus, Inject, Req } from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { RegisterUserUseCase } from '../../../domain/auth/application/use-cases/register-user';
import { AuditLogger } from '../../../domain/auth/application/services/audit-logger';
import { Public } from '../../../infra/auth/public';
import { RegisterSubscriberDto } from '../dtos/register-subscriber.dto';

@ApiTags('Auth')
@Controller('/auth/signup')
export class RegisterUserController {
    constructor(
        private registerUser: RegisterUserUseCase,
        @Inject(AuditLogger) private auditLogger: AuditLogger,
    ) { }

    @Post()
    @Public()
    @HttpCode(HttpStatus.CREATED)
    @ApiBody({ type: RegisterSubscriberDto })
    @ApiOperation({ summary: 'Registrar novo usuário (cadastro completo: contato, documento, estúdio)' })
    @ApiResponse({
        status: 201,
        description: 'Usuário criado com sucesso',
        schema: {
            example: {
                user: {
                    id: 'uuid-aqui',
                    name: 'João Silva',
                    email: 'joao@email.com',
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
        status: 409,
        description: 'Email já cadastrado',
    })
    async handle(@Body() body: RegisterSubscriberDto, @Req() req: Request) {
        const { name, email, password, phone, document, studioName, studioSlug } = body;

        const { user } = await this.registerUser.execute({
            name,
            email,
            password,
            phone,
            document,
            studioName,
            studioSlug,
        });

        // Registrar log de auditoria
        const ipAddress = req.ip || req.socket.remoteAddress || null;
        const userAgent = req.get('user-agent') || null;

        await this.auditLogger.log({
            userId: user.id.toString(),
            action: 'USER_REGISTERED',
            entityType: 'User',
            entityId: user.id.toString(),
            metadata: {
                email: user.email,
            },
            ipAddress,
            userAgent,
        });

        return {
            user: {
                id: user.id.toString(),
                name: user.name,
                email: user.email,
                phone: user.phone,
                document: user.document,
                studioName: user.studioName,
                studioSlug: user.studioSlug,
                createdAt: user.createdAt,
            },
        };
    }
}