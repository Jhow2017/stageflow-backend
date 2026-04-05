import { Body, Controller, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { User } from '../../../domain/auth/enterprise/entities/user';
import { UpdateStudioPayoutProviderUseCase } from '../../../domain/booking/application/use-cases/update-studio-payout-provider';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { UpdateStudioPayoutProviderDto } from '../dtos/update-studio-payout-provider.dto';

@ApiTags('Financeiro — provedor de recebimento')
@Controller('financeiro/studios/:studioId')
@UseGuards(JwtAuthGuard)
export class FinanceStudioPayoutController {
    constructor(private readonly updateStudioPayoutProvider: UpdateStudioPayoutProviderUseCase) { }

    @Patch('payout-provider')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Definir recebimento de reservas: Mercado Pago ou Stripe Connect' })
    @ApiParam({ name: 'studioId' })
    @ApiResponse({ status: 200, description: 'Atualizado' })
    @ApiResponse({ status: 400, description: 'Stripe Connect incompleto ao escolher STRIPE' })
    async patchPayoutProvider(
        @Param('studioId') studioId: string,
        @Body() body: UpdateStudioPayoutProviderDto,
        @Req() req: Request,
    ) {
        const user = req.user as User;
        await this.updateStudioPayoutProvider.execute({
            studioId,
            payoutProvider: body.payoutProvider,
            requesterUserId: user.id.toString(),
            requesterRole: user.role,
        });
        return { ok: true };
    }
}
