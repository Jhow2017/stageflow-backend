# Mercado Pago no Reserva Estúdio (backend)

Este documento resume **o que foi implementado neste repositório** e como configurar. Para o padrão detalhado (GigManager), veja [integracao-mercadopago-gigmanager.md](./integracao-mercadopago-gigmanager.md).

## Variáveis de ambiente

Use [.env.example](../.env.example) como referência. Pontos críticos:

| Variável | Uso |
|----------|-----|
| `BACKEND_URL` | Base pública da API; monta `notification_url` dos pagamentos MP e URLs de webhook. |
| `FRONTEND_URL` | Redirect após OAuth do vendedor; `back_urls` da assinatura MP na infra. |
| `MERCADOPAGO_ACCESS_TOKEN` | Conta da **aplicação** — assinatura da plataforma (preapproval / pagamento transparente). |
| `MERCADOPAGO_PUBLIC_KEY` | Chave **pública** da mesma aplicação; o `GET /subscription-checkout/:id` devolve `checkout.mercadoPagoPublicKey` quando `platformPaymentProvider === MERCADOPAGO` e `paymentMethod === CARD` (Mercado Pago.js no front). |
| `MERCADOPAGO_WEBHOOK_SECRET_KEY` | HMAC dos webhooks (`x-signature`); em produção sem chave, webhooks são rejeitados. |
| `PLATFORM_SUBSCRIPTION_PROVIDER` | `mercadopago` (padrão) ou `stripe` para novos checkouts de assinatura. |
| `MERCADOPAGO_OAUTH_REDIRECT_URI` | Deve coincidir com o app no painel MP (ex.: `{BACKEND_URL}/auth/mercadopago/callback`). |
| `MERCADOPAGO_BOOKING_APPLICATION_FEE_PERCENT` | Percentual retido pela plataforma em reservas quando o dono usou **OAuth** (marketplace). |

## Endpoints principais

### Assinatura da plataforma (MP)

- `GET /subscription-checkout/:id` — inclui `checkout.mercadoPagoPublicKey` (ou `null` se não configurada) para checkout **cartão** + MP.
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
- [test/rest-client/subscription-checkout/mercadopago-assinatura.fluxo.http](../test/rest-client/subscription-checkout/mercadopago-assinatura.fluxo.http) — passo a passo MP (PIX/BOLETO, cartão, webhook)
- [test/rest-client/booking/payments.http](../test/rest-client/booking/payments.http)
- [test/rest-client/financeiro/payout-provider.http](../test/rest-client/financeiro/payout-provider.http)
- [test/rest-client/mercadopago/oauth-and-webhooks.http](../test/rest-client/mercadopago/oauth-and-webhooks.http)

## QA — matriz rápida (sandbox)

| Cenário | Pré-condição | Resultado esperado |
|--------|----------------|---------------------|
| Assinatura PIX | `MERCADOPAGO_ACCESS_TOKEN`; checkout `paymentMethod` PIX | `transparent-payment` retorna QR; após pagar no sandbox + webhook (ou approve OWNER), checkout `APPROVED`. |
| Assinatura cartão | + `MERCADOPAGO_PUBLIC_KEY`; GET checkout com `mercadoPagoPublicKey` preenchida | `preapproval` → MP.js → `preapproval/card`; webhook ou polling até `APPROVED`. |
| Reserva MP | Estúdio `payoutProvider` MERCADOPAGO; dono com OAuth ou credenciais manuais | `payment-intent` retorna `publicKey` do **vendedor**; `mercadopago/payment` com cartão ou `paymentMethodId: pix`. |
| Reserva Stripe | Estúdio com Connect habilitado | `payment-intent` retorna `clientSecret` (fluxo Stripe). |
| Erro vendedor | Reserva + estúdio MP sem token do dono | `MercadoPagoSellerNotConnectedError` (400). |
| Erro provedor | `mercadopago/payment` com estúdio Stripe | `BookingPayoutProviderNotMercadoPagoError` (400). |

## Migração Prisma

Aplique a migração que adiciona `payoutProvider`, campos MP em `User`, ids MP em `Booking` / `SubscriptionCheckout` e a tabela de idempotência de webhooks quando o Postgres estiver disponível (`npx prisma migrate dev` ou deploy equivalente).
