import type { BrDomainAvailabilityGatewayResult } from './services/br-domain-availability-gateway';

export function summaryPtFromIsavailResult(result: BrDomainAvailabilityGatewayResult): string {
    const code = result.statusCode;
    switch (code) {
        case 0:
            return 'Domínio disponível para registro no Registro.br.';
        case 1:
            return 'Domínio disponível, porém há tickets concorrentes em aberto no Registro.br.';
        case 2:
            return 'Domínio já registrado.';
        case 3:
            return 'Domínio indisponível para registro (reservado ou restrito).';
        case 4:
            return 'Consulta inválida. Verifique o formato do domínio .br.';
        case 5:
            return 'Domínio em processo de liberação; aguarde a conclusão no Registro.br.';
        case 6:
            return 'Domínio disponível em processo de liberação em andamento.';
        case 7:
            return 'Domínio em liberação em andamento, com tickets concorrentes.';
        case 8:
            return (
                result.serviceMessage?.trim() ||
                'Serviço de disponibilidade temporariamente indisponível ou limite de consultas excedido.'
            );
        case 9:
            return 'Domínio em processo de liberação competitivo no Registro.br.';
        default:
            return 'Resposta inesperada do serviço de disponibilidade.';
    }
}
