# Subscription Checkout — Next.js (Server Actions + tipos)

Referência para implementar no **frontend Next.js** o fluxo já alinhado ao backend **ReservaEstudio** (`POST /subscription-checkout/start`, `GET /:id`, `POST /:id/stripe/session`).

Swagger do backend: `{BACKEND_URL}/api` (ex.: `http://localhost:4000/api`).

---

## Princípio

| Camada | Responsabilidade |
|--------|------------------|
| **Server Actions** | Chamar a API com `Authorization: Bearer <accessToken>` (token em cookie/httpOnly conforme seu auth). |
| **Client Component (pequeno)** | Stripe.js + Embedded Checkout usando o `clientSecret` retornado pela action de sessão. |

Variáveis de ambiente no **Next** (exemplo):

- `NEXT_PUBLIC_API_URL` — URL base da API (ex.: `http://localhost:4000`)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — `pk_test_...` (somente publishable no cliente)

O **secret** do Stripe (`sk_test_...`) fica só no backend Nest, nunca no Next.

---

## Estrutura de pastas sugerida

```
src/shared/types/subscription-checkout.ts

src/shared/service/actions/subscription-checkout/
  startSubscriptionCheckout.ts          # 'use server'
  getSubscriptionCheckoutById.ts        # 'use server'
  createSubscriptionStripeSession.ts    # 'use server'

# opcional (painel OWNER / admin)
src/shared/service/actions/subscription-checkout/
  approveSubscriptionCheckout.ts        # 'use server'
```

Dependências internas que o projeto já costuma ter (ajuste imports):

- `makeRequest` — fetch tipado para a API
- `getAccessToken` — lê cookie de sessão no servidor
- `handleServerError` + tipo `ServerActionResult<T>`

---

## Tipos (`src/shared/types/subscription-checkout.ts`)

```typescript
export type PlanTier = 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
export type BillingCycle = 'MONTHLY' | 'ANNUAL';
export type DomainType = 'SUBDOMAIN' | 'CUSTOM_DOMAIN';
export type PaymentMethod = 'CARD' | 'PIX' | 'BOLETO';

export type SubscriptionCheckoutStatus =
  | 'PENDING_PAYMENT'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXPIRED';

export interface StartSubscriptionCheckoutRequest {
  planTier: PlanTier;
  billingCycle: BillingCycle;
  /** Opcional se o usuário já preencheu no cadastro (`/auth/signup`). */
  studioName?: string;
  /**
   * `SUBDOMAIN` = subdomínio gratuito (UI: opção "Subdomínio gratuito").
   * `CUSTOM_DOMAIN` = domínio próprio (UI: opção "Domínio próprio"; add-on no Stripe — preço extra pode ser v2 na UI).
   */
  domainType: DomainType;
  /**
   * Slug do subdomínio gratuito (ex. `seuestudio`). Obrigatório quando `domainType === 'SUBDOMAIN'`,
   * seja no body ou via `studioSlug` já salvo no perfil.
   */
  subdomain?: string;
  /** Obrigatório quando `domainType === 'CUSTOM_DOMAIN'`. */
  customDomain?: string;
  paymentMethod: PaymentMethod;
  totalAmount: number;
}

export interface SubscriptionCheckoutDto {
  id: string;
  planTier: string;
  billingCycle: string;
  studioName: string;
  ownerName: string;
  ownerEmail: string;
  domainType: string;
  subdomain: string | null;
  customDomain: string | null;
  paymentMethod: string;
  totalAmount: number;
  status: SubscriptionCheckoutStatus;
  studioId: string | null;
  subscriberUserId: string | null;
  paymentReference: string | null;
  stripeCheckoutSessionId: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StartSubscriptionCheckoutResponse {
  checkout: SubscriptionCheckoutDto;
}

export interface GetSubscriptionCheckoutResponse {
  checkout: SubscriptionCheckoutDto;
}

export interface CreateSubscriptionStripeSessionResponse {
  stripe: {
    sessionId: string;
    clientSecret: string;
  };
}

export interface ApproveSubscriptionCheckoutRequest {
  paymentReference?: string;
}
```

---

## Cadastro (`POST /auth/signup`)

O contrato público exige, além de `name`, `email` e `password`, os campos:

- `phone`, `document` (CPF 11 ou CNPJ 14 dígitos, com ou sem máscara),
- `studioName`, `studioSlug` (slug: min. 3 caracteres, apenas `a-z` e hífens, padrão `^[a-z]+(?:-[a-z]+)*$`).

Esses dados ficam no **perfil do usuário** e são reutilizados em `subscription-checkout/start` quando `studioName` / `subdomain` não forem enviados no body.

O login (`POST /auth/signin`) devolve o usuário com `phone`, `document`, `studioName`, `studioSlug` para o front exibir ou preencher.

---

## Server Action — iniciar checkout

**Arquivo:** `startSubscriptionCheckout.ts`

```typescript
'use server';

import { makeRequest } from '../../makeRequest';
import { handleServerError, ServerActionResult } from '../../../utils/handleServerError';
import { getAccessToken } from '../../../utils/cookies';
import {
  StartSubscriptionCheckoutRequest,
  StartSubscriptionCheckoutResponse,
} from '../../../types/subscription-checkout';

export async function startSubscriptionCheckout(
  data: StartSubscriptionCheckoutRequest,
): Promise<ServerActionResult<StartSubscriptionCheckoutResponse>> {
  try {
    const token = await getAccessToken();
    if (!token) {
      return {
        success: false,
        error: 'Usuário não autenticado. Por favor, faça login.',
      };
    }

    const response = await makeRequest<StartSubscriptionCheckoutResponse>(
      '/subscription-checkout/start',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      },
    );

    return { success: true, ...response };
  } catch (error: unknown) {
    console.error('Erro ao iniciar checkout de assinatura:', error);
    return handleServerError(error);
  }
}
```

- **Endpoint:** `POST /subscription-checkout/start`
- **Resposta esperada:** `201` com `{ checkout: { ... } }`

---

## Server Action — consultar checkout

**Arquivo:** `getSubscriptionCheckoutById.ts`

```typescript
'use server';

import { makeRequest } from '../../makeRequest';
import { handleServerError, ServerActionResult } from '../../../utils/handleServerError';
import { getAccessToken } from '../../../utils/cookies';
import { GetSubscriptionCheckoutResponse } from '../../../types/subscription-checkout';

export async function getSubscriptionCheckoutById(
  checkoutId: string,
): Promise<ServerActionResult<GetSubscriptionCheckoutResponse>> {
  try {
    const token = await getAccessToken();
    if (!token) {
      return {
        success: false,
        error: 'Usuário não autenticado. Por favor, faça login.',
      };
    }

    const response = await makeRequest<GetSubscriptionCheckoutResponse>(
      `/subscription-checkout/${encodeURIComponent(checkoutId)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return { success: true, ...response };
  } catch (error: unknown) {
    console.error('Erro ao buscar checkout:', error);
    return handleServerError(error);
  }
}
```

- **Endpoint:** `GET /subscription-checkout/:checkoutId`

---

## Server Action — criar sessão Stripe (Embedded)

**Arquivo:** `createSubscriptionStripeSession.ts`

```typescript
'use server';

import { makeRequest } from '../../makeRequest';
import { handleServerError, ServerActionResult } from '../../../utils/handleServerError';
import { getAccessToken } from '../../../utils/cookies';
import { CreateSubscriptionStripeSessionResponse } from '../../../types/subscription-checkout';

export async function createSubscriptionStripeSession(
  checkoutId: string,
): Promise<ServerActionResult<CreateSubscriptionStripeSessionResponse>> {
  try {
    const token = await getAccessToken();
    if (!token) {
      return {
        success: false,
        error: 'Usuário não autenticado. Por favor, faça login.',
      };
    }

    const response = await makeRequest<CreateSubscriptionStripeSessionResponse>(
      `/subscription-checkout/${encodeURIComponent(checkoutId)}/stripe/session`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return { success: true, ...response };
  } catch (error: unknown) {
    console.error('Erro ao criar sessão Stripe:', error);
    return handleServerError(error);
  }
}
```

- **Endpoint:** `POST /subscription-checkout/:checkoutId/stripe/session`
- **Body:** vazio
- **Resposta:** `{ stripe: { sessionId, clientSecret } }`
- O **`clientSecret`** alimenta o componente cliente do Stripe (Embedded / `embedded_page`).

---

## Server Action opcional — aprovar (OWNER)

**Arquivo:** `approveSubscriptionCheckout.ts`

Use só se o fluxo manual V1 com usuário **OWNER** for necessário no painel.

```typescript
'use server';

import { makeRequest } from '../../makeRequest';
import { handleServerError, ServerActionResult } from '../../../utils/handleServerError';
import { getAccessToken } from '../../../utils/cookies';
import {
  ApproveSubscriptionCheckoutRequest,
  StartSubscriptionCheckoutResponse,
} from '../../../types/subscription-checkout';

export async function approveSubscriptionCheckout(
  checkoutId: string,
  body?: ApproveSubscriptionCheckoutRequest,
): Promise<ServerActionResult<StartSubscriptionCheckoutResponse>> {
  try {
    const token = await getAccessToken();
    if (!token) {
      return {
        success: false,
        error: 'Usuário não autenticado. Por favor, faça login.',
      };
    }

    const response = await makeRequest<StartSubscriptionCheckoutResponse>(
      `/subscription-checkout/${encodeURIComponent(checkoutId)}/approve`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: body ? JSON.stringify(body) : undefined,
      },
    );

    return { success: true, ...response };
  } catch (error: unknown) {
    console.error('Erro ao aprovar checkout:', error);
    return handleServerError(error);
  }
}
```

- **Endpoint:** `POST /subscription-checkout/:checkoutId/approve`
- **Guard:** `JwtAuthGuard` + `OwnerGuard`

---

## Fluxo na página (resumo)

1. Usuário autenticado (token disponível para as actions).
2. `startSubscriptionCheckout(payload)` → guardar `checkout.id`.
3. `createSubscriptionStripeSession(checkout.id)` → obter `stripe.clientSecret`.
4. Renderizar um **Client Component** que chama Stripe.js e monta o Checkout embutido com esse `clientSecret` (e `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`).
5. Após pagamento, o Stripe redireciona para a **`return_url`** definida no backend:  
   `{FRONTEND_URL}/signup/sucesso?session_id={CHECKOUT_SESSION_ID}`  
   Garanta que essa rota exista no Next e que `FRONTEND_URL` no **Nest** seja a mesma base do front.
6. (Opcional) `getSubscriptionCheckoutById` em loop leve ou após redirect até `status === 'APPROVED'` e `studioId` preenchido.

---

## Cliente Stripe (não é Server Action)

O trecho que usa `@stripe/stripe-js` / Embedded Checkout deve ficar em componente com **`'use client'`**, recebendo `clientSecret` via props (resultado da action `createSubscriptionStripeSession`).

Não coloque `clientSecret` em URL pública, logs persistentes ou repositório.

---

## Referência cruzada

- Contratos HTTP de teste: `test/rest-client/subscription-checkout/contract.http`
- Checklist E2E Stripe: `docs/stripe-phase2-e2e-checklist.md`
