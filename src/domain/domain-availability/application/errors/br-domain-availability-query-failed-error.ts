import { UseCaseError } from '../../../../core/errors/use-case-error';

export class BrDomainAvailabilityQueryFailedError extends UseCaseError {
    constructor(message = 'Não foi possível consultar a disponibilidade no Registro.br. Tente novamente em instantes.') {
        super(message);
    }
}
