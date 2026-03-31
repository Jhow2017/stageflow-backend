import { Controller, Post, Body, HttpCode, HttpStatus, Inject, Req, Param, UseGuards, BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { RegisterUserUseCase } from '../../../domain/auth/application/use-cases/register-user';
import { AuditLogger } from '../../../domain/auth/application/services/audit-logger';
import { RegisterUserDto } from '../dtos/register-user.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { OwnerGuard } from '../../auth/owner.guard';
import { Role } from '../../../domain/auth/enterprise/value-objects/role';
import { User } from '../../../domain/auth/enterprise/entities/user';

@ApiTags('Auth')
@Controller('/auth/signup')
export class RegisterUserByRoleController {
    constructor(
        private registerUser: RegisterUserUseCase,
        @Inject(AuditLogger) private auditLogger: AuditLogger,
    ) { }

    @Post(':role')
    @UseGuards(JwtAuthGuard, OwnerGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Registrar usuário com papel (apenas OWNER)' })
    @ApiParam({
        name: 'role',
        enum: [Role.ADMIN, Role.OWNER],
        description: 'Papel do novo usuário',
    })
    @ApiResponse({
        status: 201,
        description: 'Usuário criado com sucesso',
    })
    @ApiResponse({
        status: 403,
        description: 'Acesso negado (somente OWNER)',
    })
    @ApiResponse({
        status: 409,
        description: 'Email já cadastrado',
    })
    async handle(
        @Param('role') roleParam: string,
        @Body() body: RegisterUserDto,
        @Req() req: Request,
    ) {
        const role = roleParam?.toUpperCase() as Role;
        if (role !== Role.ADMIN && role !== Role.OWNER) {
            throw new BadRequestException('Role must be ADMIN or OWNER');
        }

        const { name, email, password } = body;
        const { user } = await this.registerUser.execute({
            name,
            email,
            password,
            role,
        });

        const authenticatedUser = req.user as User;
        const ipAddress = req.ip || req.socket.remoteAddress || null;
        const userAgent = req.get('user-agent') || null;

        await this.auditLogger.log({
            userId: authenticatedUser?.id?.toString() ?? null,
            action: 'USER_REGISTERED_BY_OWNER',
            entityType: 'User',
            entityId: user.id.toString(),
            metadata: {
                email: user.email,
                role: user.role,
            },
            ipAddress,
            userAgent,
        });

        return {
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
