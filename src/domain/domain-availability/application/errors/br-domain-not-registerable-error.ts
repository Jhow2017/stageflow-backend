import { UseCaseError } from '../../../../core/errors/use-case-error';

/** Domínio .br não está disponível para registro (ou consulta inválida), conforme ISAVAIL. */
export class BrDomainNotRegisterableError extends UseCaseError {
    constructor(message: string) {
        super(message);
    }
}
