import { Injectable } from '@nestjs/common';
import * as dgram from 'node:dgram';
import {
    BrDomainAvailabilityGateway,
    BrDomainAvailabilityGatewayResult,
} from '../../domain/domain-availability/application/services/br-domain-availability-gateway';

/** Host do serviço ISAVAIL (UDP/43). Ajuste com `REGISTRO_BR_ISAVAIL_HOST` se necessário. */
const DEFAULT_HOST = 'avail.registro.br';
const DEFAULT_PORT = 43;
const QUERY_TIMEOUT_MS = 8000;
const INITIAL_COOKIE = '00000000000000000000';

function requireEnvOptional(name: string): string | undefined {
    const v = process.env[name];
    return v && v.trim() !== '' ? v.trim() : undefined;
}

function randomQueryId(): string {
    return String(Math.floor(1_000_000_000 + Math.random() * 9_000_000_000));
}

function parseCookieLine(text: string): string | null {
    const t = text.trim();
    if (!t.startsWith('CK ')) {
        return null;
    }
    const parts = t.split(/\s+/);
    return parts[1] ?? null;
}

function parseStAnswer(text: string): BrDomainAvailabilityGatewayResult {
    const lines = text
        .split(/\r\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0);

    const stIdx = lines.findIndex((l) => l.startsWith('ST '));
    if (stIdx < 0) {
        return {
            fqdn: '',
            statusCode: -1,
            queryId: null,
            extraLines: lines,
            serviceMessage: 'Resposta ISAVAIL sem linha ST.',
        };
    }

    const stParts = lines[stIdx].split(/\s+/);
    const statusCode = Number.parseInt(stParts[1] ?? '', 10);
    const queryId = stParts[2] ?? null;
    const extraLines = lines.slice(stIdx + 1);

    let serviceMessage: string | null = null;
    if (statusCode === 8 && extraLines.length > 0) {
        serviceMessage = extraLines.join(' ');
    }

    const fqdnLine = extraLines[0] ?? '';

    return {
        fqdn: fqdnLine.split('|')[0] ?? fqdnLine,
        statusCode: Number.isFinite(statusCode) ? statusCode : -1,
        queryId,
        extraLines,
        serviceMessage,
    };
}

@Injectable()
export class IsavailUdpBrDomainAvailabilityGateway extends BrDomainAvailabilityGateway {
    private storedCookie: string | null = null;

    private getHost(): string {
        return requireEnvOptional('REGISTRO_BR_ISAVAIL_HOST') ?? DEFAULT_HOST;
    }

    private getPort(): number {
        const raw = requireEnvOptional('REGISTRO_BR_ISAVAIL_PORT');
        if (!raw) return DEFAULT_PORT;
        const n = Number.parseInt(raw, 10);
        return Number.isFinite(n) && n > 0 && n < 65536 ? n : DEFAULT_PORT;
    }

    private sendQuery(query: string): Promise<Buffer> {
        const host = this.getHost();
        const port = this.getPort();
        const payload = Buffer.from(query, 'latin1');

        return new Promise((resolve, reject) => {
            const socket = dgram.createSocket('udp4');
            const timer = setTimeout(() => {
                socket.close();
                reject(new Error('ISAVAIL UDP timeout'));
            }, QUERY_TIMEOUT_MS);

            socket.once('error', (err) => {
                clearTimeout(timer);
                socket.close();
                reject(err);
            });

            socket.once('message', (msg) => {
                clearTimeout(timer);
                socket.close();
                resolve(msg);
            });

            socket.send(payload, port, host, (err) => {
                if (err) {
                    clearTimeout(timer);
                    socket.close();
                    reject(err);
                }
            });
        });
    }

    async checkAvailability(fqdn: string): Promise<BrDomainAvailabilityGatewayResult> {
        let cookie = this.storedCookie ?? INITIAL_COOKIE;
        const qid = randomQueryId();

        for (let attempt = 0; attempt < 4; attempt++) {
            const query = `0 ${cookie} 1 ${qid} ${fqdn}`;
            const buf = await this.sendQuery(query);
            const text = buf.toString('latin1');

            const newCookie = parseCookieLine(text);
            if (newCookie) {
                this.storedCookie = newCookie;
                cookie = newCookie;
                continue;
            }

            const parsed = parseStAnswer(text);
            if (parsed.statusCode >= 0) {
                if (!parsed.fqdn) {
                    parsed.fqdn = fqdn;
                }
                return parsed;
            }

            throw new Error(`ISAVAIL parse error: ${text.slice(0, 200)}`);
        }

        throw new Error('ISAVAIL cookie negotiation failed');
    }
}
