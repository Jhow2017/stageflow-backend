import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { User } from '../../../domain/auth/enterprise/entities/user';
import { ApproveSubscriptionCheckoutUseCase } from '../../../domain/subscription-checkout/application/use-cases/approve-subscription-checkout';
import { CreateSubscriptionCheckoutStripeSessionUseCase } from '../../../domain/subscription-checkout/application/use-cases/create-subscription-checkout-stripe-session';
import { GetSubscriptionCheckoutUseCase } from '../../../domain/subscription-checkout/application/use-cases/get-subscription-checkout';
import { StartSubscriptionCheckoutUseCase } from '../../../domain/subscription-checkout/application/use-cases/start-subscription-checkout';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { OwnerGuard } from '../../auth/owner.guard';
import { ApproveSubscriptionCheckoutDto } from '../dtos/approve-subscription-checkout.dto';
import { StartSubscriptionCheckoutDto } from '../dtos/start-subscription-checkout.dto';

@ApiTags('Subscription Checkout')
@Controller('/subscription-checkout')
export class SubscriptionCheckoutController {
    constructor(
        private startSubscriptionCheckoutUseCase: StartSubscriptionCheckoutUseCase,
        private getSubscriptionCheckoutUseCase: GetSubscriptionCheckoutUseCase,
        private approveSubscriptionCheckoutUseCase: ApproveSubscriptionCheckoutUseCase,
        private createSubscriptionCheckoutStripeSessionUseCase: CreateSubscriptionCheckoutStripeSessionUseCase,
    ) { }

    @Post('/start')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Iniciar checkout de assinatura (usuário autenticado)' })
    @ApiBody({ type: StartSubscriptionCheckoutDto })
    @ApiResponse({ status: 201, description: 'Checkout iniciado com sucesso' })
    @ApiResponse({ status: 400, description: 'Dados inválidos de domínio/plano' })
    @ApiResponse({ status: 401, description: 'Não autenticado' })
    @ApiResponse({ status: 409, description: 'Subdomínio indisponível' })
    async start(@Body() body: StartSubscriptionCheckoutDto, @Req() req: Request) {
        const user = req.user as User;
        const { checkoutSession } = await this.startSubscriptionCheckoutUseCase.execute({
            ...body,
            subscriberUserId: user.id.toString(),
            subscriberName: user.name,
            subscriberEmail: user.email,
        });

        return this.mapSession(checkoutSession);
    }

    @Get('/:checkoutId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Consultar status de checkout de assinatura' })
    @ApiParam({ name: 'checkoutId' })
    @ApiResponse({ status: 200, description: 'Checkout encontrado' })
    @ApiResponse({ status: 401, description: 'Não autenticado' })
    @ApiResponse({ status: 403, description: 'Acesso negado para este checkout' })
    @ApiResponse({ status: 404, description: 'Checkout não encontrado' })
    async getById(@Param('checkoutId') checkoutId: string, @Req() req: Request) {
        const user = req.user as User;
        const { checkoutSession } = await this.getSubscriptionCheckoutUseCase.execute({
            checkoutId,
            requesterUserId: user.id.toString(),
            requesterRole: user.role,
        });
        return this.mapSession(checkoutSession);
    }

    @Post('/:checkoutId/stripe/session')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Criar sessão Stripe Embedded Checkout para assinatura' })
    @ApiParam({ name: 'checkoutId' })
    @ApiResponse({
        status: 201,
        description: 'Sessão Stripe criada com sucesso',
        schema: {
            example: {
                stripe: {
                    sessionId: 'cs_test_123',
                    clientSecret: 'cs_test_123_secret_456',
                },
            },
        },
    })
    @ApiResponse({ status: 401, description: 'Não autenticado' })
    @ApiResponse({ status: 403, description: 'Acesso negado para este checkout' })
    @ApiResponse({ status: 404, description: 'Checkout não encontrado' })
    @ApiResponse({ status: 400, description: 'Checkout não está pendente de pagamento' })
    async createStripeSession(@Param('checkoutId') checkoutId: string, @Req() req: Request) {
        const user = req.user as User;
        const stripe = await this.createSubscriptionCheckoutStripeSessionUseCase.execute({
            checkoutId,
            requesterUserId: user.id.toString(),
            requesterRole: user.role,
        });

        return { stripe };
    }

    @Post('/:checkoutId/approve')
    @UseGuards(JwtAuthGuard, OwnerGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Aprovar checkout de assinatura (V1 manual, somente OWNER)' })
    @ApiParam({ name: 'checkoutId' })
    @ApiBody({ type: ApproveSubscriptionCheckoutDto, required: false })
    @ApiResponse({ status: 200, description: 'Checkout aprovado e studio provisionado' })
    @ApiResponse({ status: 401, description: 'Não autenticado' })
    @ApiResponse({ status: 403, description: 'Acesso negado (somente OWNER)' })
    @ApiResponse({ status: 400, description: 'Status inválido para aprovação' })
    @ApiResponse({ status: 404, description: 'Checkout não encontrado' })
    async approve(
        @Param('checkoutId') checkoutId: string,
        @Body() body: ApproveSubscriptionCheckoutDto,
    ) {
        const { checkoutSession } = await this.approveSubscriptionCheckoutUseCase.execute({
            checkoutId,
            paymentReference: body?.paymentReference,
        });
        return this.mapSession(checkoutSession);
    }

    private mapSession(checkoutSession: {
        id: { toString(): string };
        planTier: string;
        billingCycle: string;
        studioName: string;
        ownerName: string;
        ownerEmail: string;
        domainType: string;
        subdomain: string | null;
        customDomain: string | null;
        paymentMethod: string;
        totalAmount: number;
        status: string;
        studioId: string | null;
        subscriberUserId: string | null;
        paymentReference: string | null;
        stripeCheckoutSessionId: string | null;
        stripeCustomerId: string | null;
        stripeSubscriptionId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }) {
        return {
            checkout: {
                id: checkoutSession.id.toString(),
                planTier: checkoutSession.planTier,
                billingCycle: checkoutSession.billingCycle,
                studioName: checkoutSession.studioName,
                ownerName: checkoutSession.ownerName,
                ownerEmail: checkoutSession.ownerEmail,
                domainType: checkoutSession.domainType,
                subdomain: checkoutSession.subdomain,
                customDomain: checkoutSession.customDomain,
                paymentMethod: checkoutSession.paymentMethod,
                totalAmount: checkoutSession.totalAmount,
                status: checkoutSession.status,
                studioId: checkoutSession.studioId,
                subscriberUserId: checkoutSession.subscriberUserId,
                paymentReference: checkoutSession.paymentReference,
                stripeCheckoutSessionId: checkoutSession.stripeCheckoutSessionId,
                stripeCustomerId: checkoutSession.stripeCustomerId,
                stripeSubscriptionId: checkoutSession.stripeSubscriptionId,
                createdAt: checkoutSession.createdAt,
                updatedAt: checkoutSession.updatedAt,
            },
        };
    }
}
