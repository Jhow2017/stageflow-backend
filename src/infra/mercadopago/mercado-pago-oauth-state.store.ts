import { Injectable } from '@nestjs/common';

interface Entry {
    codeVerifier: string;
    expiresAt: number;
}

/** Armazena code_verifier por state (PKCE). Em produção, prefira Redis. */
@Injectable()
export class MercadoPagoOauthStateStore {
    private readonly store = new Map<string, Entry>();
    private readonly ttlMs = 15 * 60 * 1000;

    set(state: string, codeVerifier: string): void {
        this.store.set(state, { codeVerifier, expiresAt: Date.now() + this.ttlMs });
    }

    getVerifierAndDelete(state: string): string | null {
        const entry = this.store.get(state);
        this.store.delete(state);
        if (!entry || Date.now() > entry.expiresAt) {
            return null;
        }
        return entry.codeVerifier;
    }
}
