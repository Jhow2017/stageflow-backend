# Booking Flow Setup (Fase 1)

## 1) Estrutura criada no backend

- Multi-tenant por `studioSlug`.
- Endpoints públicos:
  - `GET /public/studios/:studioSlug/rooms`
  - `GET /public/studios/:studioSlug/rooms/:roomId/availability?year=&month=&day=`
  - `POST /public/studios/:studioSlug/bookings`
- Endpoints admin:
  - `GET /admin/studios` (visão global, somente OWNER)
  - `GET /admin/studios/:studioId` (visão global, somente OWNER)
  - `GET /admin/studio-ops/:studioSlug/bookings` (operação de estúdio)
  - `GET /admin/studio-ops/:studioSlug/clients` (operação de estúdio)
- Endpoints de checkout de assinatura:
  - `POST /subscription-checkout/start`
  - `GET /subscription-checkout/:checkoutId`
  - `POST /subscription-checkout/:checkoutId/approve` (V1 manual por OWNER)
- Endpoints da area do cliente (MVP):
  - `GET /studio/:studioSlug/client-area/profile`
  - `PATCH /studio/:studioSlug/client-area/profile`
  - `GET /studio/:studioSlug/client-area/bookings`
  - `GET /studio/:studioSlug/client-area/receipts` (placeholder V1)
  - `POST /studio/:studioSlug/client-area/banner`
  - `DELETE /studio/:studioSlug/client-area/account`
  - `POST /studio/:studioSlug/client-area/logout`

## 2) Regras implementadas

- Não permite data passada.
- Não permite fora do horário do estúdio (`openHour`/`closeHour`).
- Exige intervalo válido (`startHour < endHour` e mínimo 1 hora).
- Bloqueia conflito de horários na mesma sala/data.
- Calcula `totalPrice` no backend.
- `createAccount=true` cria conta de usuário quando ainda não existe.

## 3) Checkout oficial do studio (assinatura)

Use a coleção:
- `test/rest-client/subscription-checkout/contract.http`

Esse fluxo substitui cadastro manual de studio por admin.

## 4) Alternativa por SQL (legado)

Se preferir, ainda é possível usar seed manual por SQL.

## 5) Arquivos de teste REST

- `test/rest-client/subscription-checkout/contract.http`
- `test/rest-client/booking/public.http`
- `test/rest-client/admin/studios.http`
- `test/rest-client/client-area/mvp.http`

Substitua:
- `@roomId`
- `@adminToken`
