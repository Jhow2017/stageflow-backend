import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { User } from '../../../domain/auth/enterprise/entities/user';
import { ProcessMercadoPagoOauthCallbackUseCase } from '../../../domain/auth/application/use-cases/process-mercadopago-oauth-callback';
import { SaveMercadoPagoManualCredentialsUseCase } from '../../../domain/auth/application/use-cases/save-mercadopago-manual-credentials';
import { StartMercadoPagoOauthConnectUseCase } from '../../../domain/auth/application/use-cases/start-mercadopago-oauth-connect';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Public } from '../../auth/public';
import { MercadoPagoManualCredentialsDto } from '../dtos/mercadopago-manual-credentials.dto';

@ApiTags('Mercado Pago — conta do vendedor')
@Controller('auth/mercadopago')
export class MercadoPagoAuthController {
    constructor(
        private readonly startMercadoPagoOauthConnect: StartMercadoPagoOauthConnectUseCase,
        private readonly processMercadoPagoOauthCallback: ProcessMercadoPagoOauthCallbackUseCase,
        private readonly saveMercadoPagoManualCredentials: SaveMercadoPagoManualCredentialsUseCase,
    ) { }

    @Get('connect')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Iniciar OAuth Mercado Pago (PKCE) para receber reservas na conta do vendedor' })
    @ApiResponse({ status: 200, description: 'URL de autorização gerada' })
    async connect(@Req() req: Request) {
        const user = req.user as User;
        const { authorizationUrl, state } = await this.startMercadoPagoOauthConnect.execute({ user });
        return { mercadoPago: { authorizationUrl, state } };
    }

    @Get('callback')
    @Public()
    @ApiOperation({ summary: 'Callback OAuth (público); redireciona para o frontend' })
    async callback(
        @Query('code') code: string | undefined,
        @Query('state') state: string | undefined,
        @Res() res: Response,
    ): Promise<void> {
        const base = (process.env.FRONTEND_URL ?? 'http://localhost:3000').replace(/\/$/, '');
        try {
            if (!code?.trim() || !state?.trim()) {
                throw new Error('missing oauth params');
            }
            await this.processMercadoPagoOauthCallback.execute({ code: code.trim(), state: state.trim() });
            res.redirect(302, `${base}/configuracoes/financeiro?mp=connected`);
        } catch {
            res.redirect(302, `${base}/configuracoes/financeiro?mp=error`);
        }
    }

    @Post('manual-credentials')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Salvar access token + public key manualmente (alternativa ao OAuth)' })
    @ApiResponse({ status: 200, description: 'Credenciais salvas' })
    async manualCredentials(@Body() body: MercadoPagoManualCredentialsDto, @Req() req: Request) {
        const user = req.user as User;
        await this.saveMercadoPagoManualCredentials.execute({
            user,
            accessToken: body.accessToken,
            publicKey: body.publicKey,
        });
        return { ok: true };
    }
}
