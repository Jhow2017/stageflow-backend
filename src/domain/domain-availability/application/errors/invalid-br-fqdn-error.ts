import { UseCaseError } from '../../../../core/errors/use-case-error';

export class InvalidBrFqdnError extends UseCaseError {
    constructor() {
        super('Informe um domínio .br válido (ex.: meuestudio.com.br).');
    }
}
