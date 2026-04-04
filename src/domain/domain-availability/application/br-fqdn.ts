/** Um ou mais rótulos DNS + `.br` (ex.: `registro.br`, `nic.br`, `x.com.br`). */
const LABEL = '[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?';
const BR_FQDN_PATTERN = new RegExp(`^${LABEL}(?:\\.${LABEL})*\\.br$`, 'i');

/** Normaliza e valida FQDN .br (ASCII). IDN deve ser informado em ACE (xn--). */
export function normalizeBrFqdn(raw: string): string {
    const trimmed = raw.trim().toLowerCase();
    if (trimmed.length < 6 || trimmed.length > 253) {
        throw new Error('INVALID_BR_FQDN');
    }
    if (trimmed.includes('..') || trimmed.startsWith('.') || trimmed.endsWith('.')) {
        throw new Error('INVALID_BR_FQDN');
    }
    if (!trimmed.endsWith('.br')) {
        throw new Error('INVALID_BR_FQDN');
    }
    if (!BR_FQDN_PATTERN.test(trimmed)) {
        throw new Error('INVALID_BR_FQDN');
    }
    return trimmed;
}

export function isRegisterableIsavailStatus(statusCode: number): boolean {
    return statusCode === 0 || statusCode === 1;
}
