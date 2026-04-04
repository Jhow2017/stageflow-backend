import { BadRequestException, Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
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
/** Rotas com JWT; polling do GET após checkout esgotava o limite global (10/min por IP). */
@SkipThrottle()
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
    @ApiResponse({
        status: 409,
        description:
            'Subdomínio indisponível ou domínio .br não elegível para registro (consulta ISAVAIL / Registro.br)',
    })
    @ApiResponse({
        status: 503,
        description: 'Falha ao consultar disponibilidade do domínio .br no Registro.br (rede ou serviço ISAVAIL)',
    })
    async start(@Body() body: StartSubscriptionCheckoutDto, @Req() req: Request) {
        const user = req.user as User;
        const studioName = (body.studioName?.trim() || user.studioName?.trim() || '').trim();
        if (!studioName) {
            throw new BadRequestException(
                'studioName is required: send it in the body or save it on the user profile (signup).',
            );
        }

        const subdomain =
            body.subdomain?.trim() || user.studioSlug?.trim() || undefined;
        const customDomain = body.customDomain?.trim() || undefined;

        if (body.domainType === 'SUBDOMAIN' && !subdomain) {
            throw new BadRequestException(
                'Para subdomínio gratuito (domainType SUBDOMAIN), informe o slug em subdomain ou cadastre studioSlug no perfil.',
            );
        }

        if (body.domainType === 'CUSTOM_DOMAIN' && !customDomain) {
            throw new BadRequestException(
                'Para domínio próprio (domainType CUSTOM_DOMAIN), informe customDomain.',
            );
        }

        const { checkoutSession } = await this.startSubscriptionCheckoutUseCase.execute({
            planTier: body.planTier,
            billingCycle: body.billingCycle,
            studioName,
            domainType: body.domainType,
            subdomain,
            customDomain,
            paymentMethod: body.paymentMethod,
            totalAmount: body.totalAmount,
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
    @ApiOperation({
        summary:
            'Criar sessão Stripe Checkout (hospedado): retorna URL para redirect no navegador',
    })
    @ApiParam({ name: 'checkoutId' })
    @ApiResponse({
        status: 201,
        description: 'Sessão criada; abra stripe.url no mesmo browser (redirect)',
        schema: {
            example: {
                stripe: {
                    sessionId: 'cs_test_123',
                    url: 'https://checkout.stripe.com/c/pay/cs_test_...',
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
