export interface BrDomainAvailabilityGatewayResult {
    fqdn: string;
    /** Código numérico do protocolo ISAVAIL (0–9). */
    statusCode: number;
    queryId: string | null;
    /** Linhas extras após o cabeçalho ST (conteúdo varia por status). */
    extraLines: string[];
    /** Texto livre em erro interno (ex.: rate limit), quando houver. */
    serviceMessage: string | null;
}

export abstract class BrDomainAvailabilityGateway {
    abstract checkAvailability(fqdn: string): Promise<BrDomainAvailabilityGatewayResult>;
}
