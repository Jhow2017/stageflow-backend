import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ConfirmOnboardingUseCase } from '../../../domain/onboarding/application/use-cases/confirm-onboarding';
import { GetOnboardingSessionUseCase } from '../../../domain/onboarding/application/use-cases/get-onboarding-session';
import { StartOnboardingUseCase } from '../../../domain/onboarding/application/use-cases/start-onboarding';
import { Public } from '../../auth/public';
import { ConfirmOnboardingDto } from '../dtos/confirm-onboarding.dto';
import { StartOnboardingDto } from '../dtos/start-onboarding.dto';

@ApiTags('Onboarding')
@Controller('/onboarding')
export class OnboardingController {
    constructor(
        private startOnboardingUseCase: StartOnboardingUseCase,
        private getOnboardingSessionUseCase: GetOnboardingSessionUseCase,
        private confirmOnboardingUseCase: ConfirmOnboardingUseCase,
    ) { }

    @Post('/start')
    @Public()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Iniciar onboarding de assinatura do studio' })
    @ApiBody({ type: StartOnboardingDto })
    @ApiResponse({ status: 201, description: 'Onboarding iniciado com sucesso' })
    @ApiResponse({ status: 400, description: 'Dados inválidos de domínio/plano' })
    @ApiResponse({ status: 409, description: 'Subdomínio indisponível' })
    async start(@Body() body: StartOnboardingDto) {
        const { onboardingSession } = await this.startOnboardingUseCase.execute(body);

        return this.mapSession(onboardingSession);
    }

    @Get('/:onboardingId')
    @Public()
    @ApiOperation({ summary: 'Consultar status de onboarding' })
    @ApiParam({ name: 'onboardingId' })
    @ApiResponse({ status: 200, description: 'Onboarding encontrado' })
    @ApiResponse({ status: 404, description: 'Onboarding não encontrado' })
    async getById(@Param('onboardingId') onboardingId: string) {
        const { onboardingSession } = await this.getOnboardingSessionUseCase.execute({ onboardingId });
        return this.mapSession(onboardingSession);
    }

    @Post('/:onboardingId/confirm')
    @Public()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Confirmar onboarding após etapa de pagamento' })
    @ApiParam({ name: 'onboardingId' })
    @ApiBody({ type: ConfirmOnboardingDto, required: false })
    @ApiResponse({ status: 200, description: 'Onboarding confirmado e studio provisionado' })
    @ApiResponse({ status: 400, description: 'Status inválido para confirmação' })
    @ApiResponse({ status: 404, description: 'Onboarding não encontrado' })
    async confirm(
        @Param('onboardingId') onboardingId: string,
        @Body() _body: ConfirmOnboardingDto,
    ) {
        const { onboardingSession } = await this.confirmOnboardingUseCase.execute({ onboardingId });
        return this.mapSession(onboardingSession);
    }

    private mapSession(onboardingSession: {
        id: { toString(): string };
        planTier: string;
        billingCycle: string;
        studioName: string;
        ownerName: string;
        ownerEmail: string;
        ownerPhone: string;
        ownerDocument: string;
        domainType: string;
        subdomain: string | null;
        customDomain: string | null;
        paymentMethod: string;
        totalAmount: number;
        status: string;
        studioId: string | null;
        ownerUserId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }) {
        return {
            onboarding: {
                id: onboardingSession.id.toString(),
                planTier: onboardingSession.planTier,
                billingCycle: onboardingSession.billingCycle,
                studioName: onboardingSession.studioName,
                ownerName: onboardingSession.ownerName,
                ownerEmail: onboardingSession.ownerEmail,
                ownerPhone: onboardingSession.ownerPhone,
                ownerDocument: onboardingSession.ownerDocument,
                domainType: onboardingSession.domainType,
                subdomain: onboardingSession.subdomain,
                customDomain: onboardingSession.customDomain,
                paymentMethod: onboardingSession.paymentMethod,
                totalAmount: onboardingSession.totalAmount,
                status: onboardingSession.status,
                studioId: onboardingSession.studioId,
                ownerUserId: onboardingSession.ownerUserId,
                createdAt: onboardingSession.createdAt,
                updatedAt: onboardingSession.updatedAt,
            },
        };
    }
}
