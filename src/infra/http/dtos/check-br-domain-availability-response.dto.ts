import { ApiProperty } from '@nestjs/swagger';

export class CheckBrDomainAvailabilityResponseDto {
    @ApiProperty({ example: 'meuestudio.com.br' })
    fqdn!: string;

    @ApiProperty({
        description: 'Código de status do protocolo ISAVAIL (Registro.br), 0–9.',
        example: 0,
        minimum: 0,
        maximum: 9,
    })
    isavailStatusCode!: number;

    @ApiProperty({
        description: 'true quando o ISAVAIL indica disponível para registro (status 0 ou 1).',
        example: true,
    })
    registerableAccordingToRegistroBr!: boolean;

    @ApiProperty({
        description: 'Resumo em português para exibição no cliente.',
        example: 'Domínio disponível para registro no Registro.br.',
    })
    summaryPt!: string;

    @ApiProperty({
        description:
            'URL da busca oficial no Registro.br com o FQDN (redirect ou nova aba no front).',
        example: 'https://registro.br/busca-dominio/?fqdn=meuestudio.com.br',
    })
    registroBrSearchUrl!: string;
}
