const REGISTRO_BR_BUSCA_DOMINIO_BASE = 'https://registro.br/busca-dominio/';

/** URL da busca oficial no Registro.br com o FQDN já preenchido (para redirect no front). */
export function buildRegistroBrBuscaDominioUrl(fqdn: string): string {
    const params = new URLSearchParams({ fqdn });
    return `${REGISTRO_BR_BUSCA_DOMINIO_BASE}?${params.toString()}`;
}
