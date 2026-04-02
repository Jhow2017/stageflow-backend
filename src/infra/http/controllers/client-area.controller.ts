import {
    Body,
    Controller,
    Delete,
    Get,
    Patch,
    Post,
    Req,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { User } from '../../../domain/auth/enterprise/entities/user';
import { LogoutClientAreaUseCase } from '../../../domain/auth/application/use-cases/logout-client-area';
import { DeleteClientAreaAccountUseCase } from '../../../domain/booking/application/use-cases/delete-client-area-account';
import { GetClientAreaProfileUseCase } from '../../../domain/booking/application/use-cases/get-client-area-profile';
import { ListClientAreaBookingsUseCase } from '../../../domain/booking/application/use-cases/list-client-area-bookings';
import { ListClientAreaReceiptsUseCase } from '../../../domain/booking/application/use-cases/list-client-area-receipts';
import { UpdateClientAreaBannerUseCase } from '../../../domain/booking/application/use-cases/update-client-area-banner';
import { UpdateClientAreaProfileUseCase } from '../../../domain/booking/application/use-cases/update-client-area-profile';
import { ClientAreaScopeGuard } from '../../auth/client-area-scope.guard';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UpdateClientAreaBannerDto } from '../dtos/update-client-area-banner.dto';
import { UpdateClientAreaProfileDto } from '../dtos/update-client-area-profile.dto';

@ApiTags('Client Area')
@Controller('/studio/:studioSlug/client-area')
@UseGuards(JwtAuthGuard, ClientAreaScopeGuard)
export class ClientAreaController {
    constructor(
        private getClientAreaProfileUseCase: GetClientAreaProfileUseCase,
        private updateClientAreaProfileUseCase: UpdateClientAreaProfileUseCase,
        private listClientAreaBookingsUseCase: ListClientAreaBookingsUseCase,
        private listClientAreaReceiptsUseCase: ListClientAreaReceiptsUseCase,
        private updateClientAreaBannerUseCase: UpdateClientAreaBannerUseCase,
        private deleteClientAreaAccountUseCase: DeleteClientAreaAccountUseCase,
        private logoutClientAreaUseCase: LogoutClientAreaUseCase,
    ) { }

    @Get('/profile')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Obter perfil do cliente autenticado no studio' })
    @ApiParam({ name: 'studioSlug', example: 'super-sonic' })
    @ApiResponse({
        status: 200,
        description: 'Perfil retornado com sucesso',
        schema: {
            example: {
                profile: {
                    id: 'uuid-client',
                    studioId: 'uuid-studio',
                    userId: 'uuid-user',
                    name: 'Banda Super Sonic',
                    email: 'integrantes@supersonic.com',
                    phone: '11999998888',
                    bannerUrl: 'https://cdn.reservaestudio.app/banners/super-sonic.jpg',
                    notes: 'Prefere ensaio noturno',
                },
            },
        },
    })
    @ApiResponse({ status: 401, description: 'Não autenticado' })
    @ApiResponse({ status: 403, description: 'Usuário sem vínculo com o studio' })
    async getProfile(@Req() req: Request) {
        const user = req.user as User;
        const studioSlug = String(req.params.studioSlug);
        const { client } = await this.getClientAreaProfileUseCase.execute({
            studioSlug,
            userId: user.id.toString(),
        });

        return {
            profile: {
                id: client.id.toString(),
                studioId: client.studioId,
                userId: client.userId,
                name: client.name,
                email: client.email,
                phone: client.phone,
                bannerUrl: client.bannerUrl,
                notes: client.notes,
            },
        };
    }

    @Patch('/profile')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Atualizar perfil do cliente autenticado no studio' })
    @ApiParam({ name: 'studioSlug', example: 'super-sonic' })
    @ApiBody({ type: UpdateClientAreaProfileDto })
    @ApiResponse({
        status: 200,
        description: 'Perfil atualizado com sucesso',
        schema: {
            example: {
                profile: {
                    id: 'uuid-client',
                    studioId: 'uuid-studio',
                    userId: 'uuid-user',
                    name: 'Banda Super Sonic',
                    email: 'integrantes@supersonic.com',
                    phone: '11999998888',
                    bannerUrl: 'https://cdn.reservaestudio.app/banners/super-sonic.jpg',
                    notes: 'Prefere ensaio noturno',
                },
            },
        },
    })
    @ApiResponse({ status: 400, description: 'Payload inválido' })
    @ApiResponse({ status: 401, description: 'Não autenticado' })
    @ApiResponse({ status: 403, description: 'Usuário sem vínculo com o studio' })
    async updateProfile(@Req() req: Request, @Body() body: UpdateClientAreaProfileDto) {
        const user = req.user as User;
        const studioSlug = String(req.params.studioSlug);
        const { client } = await this.updateClientAreaProfileUseCase.execute({
            studioSlug,
            userId: user.id.toString(),
            name: body.name,
            email: body.email,
            phone: body.phone,
            notes: body.notes,
        });

        return {
            profile: {
                id: client.id.toString(),
                studioId: client.studioId,
                userId: client.userId,
                name: client.name,
                email: client.email,
                phone: client.phone,
                bannerUrl: client.bannerUrl,
                notes: client.notes,
            },
        };
    }

    @Get('/bookings')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Listar historico de agendamentos do cliente autenticado' })
    @ApiParam({ name: 'studioSlug', example: 'super-sonic' })
    @ApiResponse({
        status: 200,
        description: 'Historico retornado com sucesso',
        schema: {
            example: {
                bookings: [
                    {
                        id: 'uuid-booking',
                        studioId: 'uuid-studio',
                        roomId: 'uuid-room',
                        clientId: 'uuid-client',
                        bookingDate: '2026-04-01T00:00:00.000Z',
                        startHour: 19,
                        endHour: 21,
                        totalPrice: 160,
                        status: 'CONFIRMED',
                        paymentMethod: 'PIX',
                        paymentStatus: 'PAID',
                        createdAt: '2026-04-01T10:00:00.000Z',
                    },
                ],
            },
        },
    })
    @ApiResponse({ status: 401, description: 'Não autenticado' })
    @ApiResponse({ status: 403, description: 'Usuário sem vínculo com o studio' })
    async listBookings(@Req() req: Request) {
        const user = req.user as User;
        const studioSlug = String(req.params.studioSlug);
        const { bookings } = await this.listClientAreaBookingsUseCase.execute({
            studioSlug,
            userId: user.id.toString(),
        });

        return {
            bookings: bookings.map((booking) => ({
                id: booking.id.toString(),
                studioId: booking.studioId,
                roomId: booking.roomId,
                clientId: booking.clientId,
                bookingDate: booking.bookingDate,
                startHour: booking.startHour,
                endHour: booking.endHour,
                totalPrice: booking.totalPrice,
                status: booking.status,
                paymentMethod: booking.paymentMethod,
                paymentStatus: booking.paymentStatus,
                createdAt: booking.createdAt,
            })),
        };
    }

    @Get('/receipts')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Listar comprovantes do cliente (placeholder V1)' })
    @ApiParam({ name: 'studioSlug', example: 'super-sonic' })
    @ApiResponse({
        status: 200,
        description: 'Comprovantes placeholder retornados com sucesso',
        schema: {
            example: {
                receipts: [],
            },
        },
    })
    @ApiResponse({ status: 401, description: 'Não autenticado' })
    @ApiResponse({ status: 403, description: 'Usuário sem vínculo com o studio' })
    async listReceipts(@Req() req: Request) {
        const user = req.user as User;
        const studioSlug = String(req.params.studioSlug);
        const result = await this.listClientAreaReceiptsUseCase.execute({
            studioSlug,
            userId: user.id.toString(),
        });

        return result;
    }

    @Post('/banner')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Atualizar URL do banner do cliente' })
    @ApiParam({ name: 'studioSlug', example: 'super-sonic' })
    @ApiBody({ type: UpdateClientAreaBannerDto })
    @ApiResponse({
        status: 200,
        description: 'Banner atualizado com sucesso',
        schema: {
            example: {
                banner: {
                    bannerUrl: 'https://cdn.reservaestudio.app/banners/super-sonic.jpg',
                },
            },
        },
    })
    @ApiResponse({ status: 400, description: 'Payload inválido' })
    @ApiResponse({ status: 401, description: 'Não autenticado' })
    @ApiResponse({ status: 403, description: 'Usuário sem vínculo com o studio' })
    async updateBanner(@Req() req: Request, @Body() body: UpdateClientAreaBannerDto) {
        const user = req.user as User;
        const studioSlug = String(req.params.studioSlug);
        const { client } = await this.updateClientAreaBannerUseCase.execute({
            studioSlug,
            userId: user.id.toString(),
            bannerUrl: body.bannerUrl,
        });

        return {
            banner: {
                bannerUrl: client.bannerUrl,
            },
        };
    }

    @Delete('/account')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Excluir conta do cliente no escopo deste studio' })
    @ApiParam({ name: 'studioSlug', example: 'super-sonic' })
    @ApiResponse({
        status: 200,
        description: 'Conta excluida com sucesso',
        schema: {
            example: {
                message: 'Conta do cliente removida com sucesso',
            },
        },
    })
    @ApiResponse({ status: 401, description: 'Não autenticado' })
    @ApiResponse({ status: 403, description: 'Usuário sem vínculo com o studio' })
    async deleteAccount(@Req() req: Request) {
        const user = req.user as User;
        const studioSlug = String(req.params.studioSlug);

        return this.deleteClientAreaAccountUseCase.execute({
            studioSlug,
            userId: user.id.toString(),
        });
    }

    @Post('/logout')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Logout da area do cliente' })
    @ApiParam({ name: 'studioSlug', example: 'super-sonic' })
    @ApiResponse({
        status: 200,
        description: 'Logout realizado com sucesso',
        schema: {
            example: {
                message: 'Logout da area do cliente realizado com sucesso',
            },
        },
    })
    @ApiResponse({ status: 401, description: 'Não autenticado' })
    @ApiResponse({ status: 403, description: 'Usuário sem vínculo com o studio' })
    async logout(@Req() req: Request) {
        const authHeader = req.headers.authorization;
        const token = authHeader?.replace('Bearer ', '');

        if (!token) {
            throw new UnauthorizedException('Token não encontrado');
        }

        return this.logoutClientAreaUseCase.execute({ token });
    }
}
