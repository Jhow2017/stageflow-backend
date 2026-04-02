# Fase 2 Stripe - Guia E2E (Embedded + Webhook)

## 1) Preparar ambiente

- Copie `.env.example` para `.env.local` (ou `.env`) e preencha todas as variáveis Stripe.
- Garanta que os `price_*` existem no Stripe Dashboard e são recorrentes.
- Suba API e banco.

## 2) Capturar tokens

- Faça login de um assinante (`USER`) para obter `subscriberToken`.
- Faça login de um `OWNER` para obter `ownerToken`.
- Atualize variáveis no arquivo `contract.http`.

## 3) Ordem de execução no REST Client

1. `startCheckout`
2. `GET /subscription-checkout/{{checkoutId}}` (ajuste `@checkoutId` com retorno do start)
3. `POST /subscription-checkout/{{checkoutId}}/stripe/session`
4. `POST /payments/stripe/webhook` (evento `checkout.session.completed`, com assinatura válida)
5. `GET /subscription-checkout/{{checkoutId}}` (esperado `APPROVED`)
6. `POST /settings/studios/{{approveCheckout...}}/rooms` (somente se quiser validar sequência até settings)

## 4) Como gerar assinatura de webhook em dev

Opção recomendada: Stripe CLI

```bash
stripe listen --forward-to http://localhost:4000/payments/stripe/webhook
```

- O comando imprime o `whsec_...` (usar em `STRIPE_WEBHOOK_SECRET`).
- Para disparar evento real:

```bash
stripe trigger checkout.session.completed
```

## 5) Critérios de sucesso

- Sessão embedded retorna `clientSecret` e `sessionId`.
- Webhook processa com `received: true`.
- Checkout muda de `PENDING_PAYMENT` para `APPROVED`.
- Reenvio do mesmo evento não duplica processamento (idempotência por `eventId`).

## 6) Cenários negativos mínimos

- Webhook sem `stripe-signature` -> `400`.
- Usuário sem vínculo acessando sessão Stripe de outro checkout -> `403`.
- Checkout já aprovado tentando nova sessão -> `400`.
