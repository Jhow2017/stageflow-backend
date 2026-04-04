import { Inject } from '@nestjs/common';
import { BrDomainAvailabilityGateway } from '../services/br-domain-availability-gateway';
import { normalizeBrFqdn } from '../br-fqdn';
import { summaryPtFromIsavailResult } from '../isavail-status-messages';
import { InvalidBrFqdnError } from '../errors/invalid-br-fqdn-error';
import { BrDomainAvailabilityQueryFailedError } from '../errors/br-domain-availability-query-failed-error';
import { buildRegistroBrBuscaDominioUrl } from '../registro-br-busca-dominio-url';

export interface CheckBrDomainAvailabilityRequest {
    fqdn: string;
}

export interface CheckBrDomainAvailabilityResponse {
    fqdn: string;
    isavailStatusCode: number;
    /** Indica se o domínio aparece como elegível para registro (status 0 ou 1 no ISAVAIL). */
    registerableAccordingToRegistroBr: boolean;
    summaryPt: string;
    /** Link para o usuário continuar no site do Registro.br (busca com FQDN). */
    registroBrSearchUrl: string;
}

export class CheckBrDomainAvailabilityUseCase {
    constructor(
        @Inject(BrDomainAvailabilityGateway)
        private readonly gateway: BrDomainAvailabilityGateway,
    ) { }

    async execute(data: CheckBrDomainAvailabilityRequest): Promise<CheckBrDomainAvailabilityResponse> {
        let fqdn: string;
        try {
            fqdn = normalizeBrFqdn(data.fqdn);
        } catch {
            throw new InvalidBrFqdnError();
        }

        let raw: Awaited<ReturnType<BrDomainAvailabilityGateway['checkAvailability']>>;
        try {
            raw = await this.gateway.checkAvailability(fqdn);
        } catch {
            throw new BrDomainAvailabilityQueryFailedError();
        }

        if (raw.statusCode === 8) {
            throw new BrDomainAvailabilityQueryFailedError(summaryPtFromIsavailResult(raw));
        }

        if (raw.statusCode < 0 || raw.statusCode > 9) {
            throw new BrDomainAvailabilityQueryFailedError();
        }

        const registerableAccordingToRegistroBr = raw.statusCode === 0 || raw.statusCode === 1;

        const resolvedFqdn = raw.fqdn || fqdn;

        return {
            fqdn: resolvedFqdn,
            isavailStatusCode: raw.statusCode,
            registerableAccordingToRegistroBr,
            summaryPt: summaryPtFromIsavailResult(raw),
            registroBrSearchUrl: buildRegistroBrBuscaDominioUrl(resolvedFqdn),
        };
    }
}
