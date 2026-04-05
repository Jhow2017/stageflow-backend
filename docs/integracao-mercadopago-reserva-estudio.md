# Mercado Pago no Reserva Estúdio (backend)

Este documento resume **o que foi implementado neste repositório** e como configurar. Para o padrão detalhado (GigManager), veja [integracao-mercadopago-gigmanager.md](./integracao-mercadopago-gigmanager.md).

## Variáveis de ambiente

Use [.env.example](../.env.example) como referência. Pontos críticos:

| Variável | Uso |
|----------|-----|
| `BACKEND_URL` | Base pública da API; monta `notification_url` dos pagamentos MP e URLs de webhook. |
| `FRONTEND_URL` | Redirect após OAuth do vendedor; `back_urls` da assinatura MP na infra. |
| `MERCADOPAGO_ACCESS_TOKEN` | Conta da **aplicação** — assinatura da plataforma (preapproval / pagamento transparente). |
| `MERCADOPAGO_WEBHOOK_SECRET_KEY` | HMAC dos webhooks (`x-signature`); em produção sem chave, webhooks são rejeitados. |
| `PLATFORM_SUBSCRIPTION_PROVIDER` | `mercadopago` (padrão) ou `stripe` para novos checkouts de assinatura. |
| `MERCADOPAGO_OAUTH_REDIRECT_URI` | Deve coincidir com o app no painel MP (ex.: `{BACKEND_URL}/auth/mercadopago/callback`). |
| `MERCADOPAGO_BOOKING_APPLICATION_FEE_PERCENT` | Percentual retido pela plataforma em reservas quando o dono usou **OAuth** (marketplace). |

## Endpoints principais

### Assinatura da plataforma (MP)

- `POST /subscription-checkout/start` — define `platformPaymentProvider` conforme env.
- `POST /subscription-checkout/:id/mercadopago/preapproval` — cartão, etapa 1.
- `POST /subscription-checkout/:id/mercadopago/preapproval/card` — body `{ "cardTokenId" }`, etapa 2.
- `POST /subscription-checkout/:id/mercadopago/transparent-payment` — PIX/boleto (identificação do pagador).
- `POST /webhooks/mercadopago/subscription` — notificações de `payment` / `preapproval` (idempotência por `resourceId` + tópico prefixado `subscription:`).

### Reservas (cliente paga o estúdio)

- `PATCH /financeiro/studios/:studioId/payout-provider` — `MERCADOPAGO` (padrão no modelo) ou `STRIPE` (exige Connect habilitado).
- `POST /public/studios/:slug/bookings/:id/payment-intent` — retorno discrimina `provider: "stripe" | "mercadopago"` (MP devolve `publicKey` e `amountReais`, sem criar pagamento ainda).
- `POST /public/studios/:slug/bookings/:id/mercadopago/payment` — cria `POST /v1/payments` no MP com token do **vendedor**; persiste `mercadoPagoPaymentId` na reserva.
- `POST /webhooks/reservations/mercadopago` — atualiza status da reserva; deduplicação com prefixo `reservation:`.

### OAuth / credenciais do dono (recebimento de reservas)

- `GET /auth/mercadopago/connect` (JWT) — URL de autorização PKCE.
- `GET /auth/mercadopago/callback` (público) — redireciona para `{FRONTEND_URL}/configuracoes/financeiro?mp=connected|error`.
- `POST /auth/mercadopago/manual-credentials` (JWT) — `accessToken` + `publicKey`.
- `POST /webhooks/mercadopago/deauthorization` — corpo `application.deauthorized` + `user_id` (sem validação HMAC, alinhado à doc GigManager).

## Contratos HTTP de teste

- [test/rest-client/subscription-checkout/contract.http](../test/rest-client/subscription-checkout/contract.http)
- [test/rest-client/booking/payments.http](../test/rest-client/booking/payments.http)
- [test/rest-client/financeiro/payout-provider.http](../test/rest-client/financeiro/payout-provider.http)
- [test/rest-client/mercadopago/oauth-and-webhooks.http](../test/rest-client/mercadopago/oauth-and-webhooks.http)

## Migração Prisma

Aplique a migração que adiciona `payoutProvider`, campos MP em `User`, ids MP em `Booking` / `SubscriptionCheckout` e a tabela de idempotência de webhooks quando o Postgres estiver disponível (`npx prisma migrate dev` ou deploy equivalente).
