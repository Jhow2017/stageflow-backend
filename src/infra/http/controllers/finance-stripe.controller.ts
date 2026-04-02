import { Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { User } from '../../../domain/auth/enterprise/entities/user';
import { CreateStudioStripeConnectOnboardingLinkUseCase } from '../../../domain/booking/application/use-cases/create-studio-stripe-connect-onboarding-link';
import { CreateStudioStripeDashboardLinkUseCase } from '../../../domain/booking/application/use-cases/create-studio-stripe-dashboard-link';
import { GetStudioStripeConnectStatusUseCase } from '../../../domain/booking/application/use-cases/get-studio-stripe-connect-status';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { GetFinanceStripeStatusDto } from '../dtos/get-finance-stripe-status.dto';

@ApiTags('Financeiro Stripe')
@Controller('/financeiro/studios/:studioId/stripe')
@UseGuards(JwtAuthGuard)
export class FinanceStripeController {
    constructor(
        private createStudioStripeConnectOnboardingLinkUseCase: CreateStudioStripeConnectOnboardingLinkUseCase,
        private getStudioStripeConnectStatusUseCase: GetStudioStripeConnectStatusUseCase,
        private createStudioStripeDashboardLinkUseCase: CreateStudioStripeDashboardLinkUseCase,
    ) { }

    @Post('/connect')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Gerar link de onboarding Connect Express para o assinante do studio' })
    @ApiParam({ name: 'studioId', example: 'uuid-do-studio' })
    @ApiResponse({
        status: 201,
        description: 'Link de onboarding gerado',
        schema: {
            example: {
                stripe: {
                    accountId: 'acct_123',
                    onboardingUrl: 'https://connect.stripe.com/...',
                },
            },
        },
    })
    @ApiResponse({ status: 401, description: 'Não autenticado' })
    @ApiResponse({ status: 403, description: 'Sem permissão para este studio' })
    @ApiResponse({ status: 404, description: 'Studio não encontrado' })
    async connect(@Param('studioId') studioId: string, @Req() req: Request) {
        const user = req.user as User;
        const stripe = await this.createStudioStripeConnectOnboardingLinkUseCase.execute({
            studioId,
            requesterUserId: user.id.toString(),
            requesterRole: user.role,
        });
        return { stripe };
    }

    @Get('/status')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Consultar status da conta Stripe conectada do studio' })
    @ApiParam({ name: 'studioId', example: 'uuid-do-studio' })
    @ApiQuery({ name: 'refresh', required: false, type: Boolean, example: true })
    @ApiResponse({ status: 200, description: 'Status Stripe retornado com sucesso' })
    async status(
        @Param('studioId') studioId: string,
        @Req() req: Request,
        @Query() query: GetFinanceStripeStatusDto,
    ) {
        const user = req.user as User;
        const stripe = await this.getStudioStripeConnectStatusUseCase.execute({
            studioId,
            requesterUserId: user.id.toString(),
            requesterRole: user.role,
            refreshFromStripe: query.refresh ?? false,
        });
        return { stripe };
    }

    @Post('/dashboard-link')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Gerar login link do Stripe Express Dashboard' })
    @ApiParam({ name: 'studioId', example: 'uuid-do-studio' })
    @ApiResponse({
        status: 201,
        description: 'Link de dashboard gerado',
        schema: {
            example: {
                stripe: {
                    url: 'https://connect.stripe.com/express/...',
                },
            },
        },
    })
    async createDashboardLink(@Param('studioId') studioId: string, @Req() req: Request) {
        const user = req.user as User;
        const stripe = await this.createStudioStripeDashboardLinkUseCase.execute({
            studioId,
            requesterUserId: user.id.toString(),
            requesterRole: user.role,
        });
        return { stripe };
    }
}
