# Booking Flow Setup (Fase 1)

## 1) Estrutura criada no backend

- Multi-tenant por `studioSlug`.
- Endpoints públicos:
  - `GET /public/studios/:studioSlug/rooms`
  - `GET /public/studios/:studioSlug/rooms/:roomId/availability?year=&month=&day=`
  - `POST /public/studios/:studioSlug/bookings`
- Endpoints admin:
  - `GET /admin/studios/:studioSlug/bookings`
  - `GET /admin/studios/:studioSlug/clients`
- Endpoints de onboarding de assinatura:
  - `POST /onboarding/start`
  - `GET /onboarding/:onboardingId`
  - `POST /onboarding/:onboardingId/confirm`

## 2) Regras implementadas

- Não permite data passada.
- Não permite fora do horário do estúdio (`openHour`/`closeHour`).
- Exige intervalo válido (`startHour < endHour` e mínimo 1 hora).
- Bloqueia conflito de horários na mesma sala/data.
- Calcula `totalPrice` no backend.
- `createAccount=true` cria conta de usuário quando ainda não existe.

## 3) Onboarding oficial do studio (assinatura)

Use a coleção:
- `test/rest-client/onboarding/contract.http`

Esse fluxo substitui cadastro manual de studio por admin.

## 4) Alternativa por SQL (legado)

Se preferir, ainda é possível usar seed manual por SQL.

## 5) Arquivos de teste REST

- `test/rest-client/onboarding/contract.http`
- `test/rest-client/booking/public.http`
- `test/rest-client/booking/admin.http`

Substitua:
- `@roomId`
- `@adminToken`
