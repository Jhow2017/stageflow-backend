import { applyDecorators } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

export const ThrottleAuth = () =>
    applyDecorators(
        Throttle({ default: { limit: 5, ttl: 60000 } }), // 5 tentativas por minuto
    );

export const ThrottleForgotPassword = () =>
    applyDecorators(
        Throttle({ default: { limit: 3, ttl: 60000 } }), // 3 tentativas por minuto
    );

/** Consultas ISAVAIL: limite do Registro.br + abuso; manter conservador. */
export const ThrottleRegistroBrIsavail = () =>
    applyDecorators(
        Throttle({ default: { limit: 8, ttl: 60000 } }),
    );