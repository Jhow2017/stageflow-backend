import { Controller, Get, Query } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    ApiServiceUnavailableResponse,
    ApiTags,
    ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { CheckBrDomainAvailabilityUseCase } from '../../../domain/domain-availability/application/use-cases/check-br-domain-availability';
import { Public } from '../../auth/public';
import { CheckBrDomainAvailabilityQueryDto } from '../dtos/check-br-domain-availability-query.dto';
import { CheckBrDomainAvailabilityResponseDto } from '../dtos/check-br-domain-availability-response.dto';
import { ThrottleRegistroBrIsavail } from '../decorators/throttle.decorator';

@ApiTags('Domain availability')
@Controller('/public/domains/br')
export class CheckBrDomainAvailabilityController {
    constructor(private readonly checkBrDomainAvailabilityUseCase: CheckBrDomainAvailabilityUseCase) { }

    @Get('/availability')
    @Public()
    @ThrottleRegistroBrIsavail()
    @ApiOperation({
        summary: 'Consultar disponibilidade de domínio .br (ISAVAIL / Registro.br)',
        description:
            'Proxy seguro para o serviço UDP do Registro.br (não exposto ao browser). ' +
            'Indica disponibilidade (ISAVAIL); use `registroBrSearchUrl` para abrir a busca oficial no Registro.br com o FQDN.',
    })
    @ApiQuery({ name: 'fqdn', type: String, example: 'meuestudio.com.br', required: true })
    @ApiOkResponse({ type: CheckBrDomainAvailabilityResponseDto, description: 'Resultado da consulta ISAVAIL' })
    @ApiBadRequestResponse({
        description: 'FQDN .br inválido',
        schema: {
            example: {
                statusCode: 400,
                message: 'Informe um domínio .br válido (ex.: meuestudio.com.br).',
                error: 'InvalidBrFqdnError',
            },
        },
    })
    @ApiTooManyRequestsResponse({
        description: 'Limite de requisições (throttle por IP)',
    })
    @ApiServiceUnavailableResponse({
        description: 'Falha de rede, timeout UDP, resposta inválida ou status 8 no ISAVAIL (ex.: rate limit do Registro.br)',
        schema: {
            example: {
                statusCode: 503,
                message: 'Não foi possível consultar a disponibilidade no Registro.br. Tente novamente em instantes.',
                error: 'BrDomainAvailabilityQueryFailedError',
            },
        },
    })
    async handle(@Query() query: CheckBrDomainAvailabilityQueryDto) {
        return this.checkBrDomainAvailabilityUseCase.execute({ fqdn: query.fqdn });
    }
}
