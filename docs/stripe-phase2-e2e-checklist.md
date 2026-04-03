# Checklist E2E — REST Client + Stripe (Fase 2)

Documento autossuficiente para testar no **ReservaEstudio Backend** (ou fork com a mesma API): assinatura SaaS com **Embedded Checkout**, webhooks, **Stripe Connect** para o estúdio e **PaymentIntent** para reservas.

---

## Pré-requisitos

- [ ] Postgres rodando (ex.: `docker compose up -d`), `DATABASE_URL` com banco `reservaestudio` (ou o nome que você usar).
- [ ] `.env` preenchido a partir de `.env.example` (mínimo para subir a API):
  - [ ] `STRIPE_SECRET_KEY` (modo teste: `sk_test_...`)
  - [ ] `STRIPE_WEBHOOK_SECRET` (em dev, use o `whsec_...` impresso pelo Stripe CLI — ver abaixo)
  - [ ] Todos os `STRIPE_PRICE_*` como **Price IDs** reais e **recorrentes** no Stripe Dashboard
  - [ ] `FRONTEND_URL` / `BACKEND_URL` coerentes com onde o front e a API rodam
- [ ] Conta **Stripe** em modo teste; produtos/preços criados para cada plano + add-on de domínio próprio.
- [ ] [Stripe CLI](https://stripe.com/docs/stripe-cli) instalado (recomendado para webhooks locais).

Arquivos HTTP de referência (ajuste variáveis `@` no topo de cada arquivo):

- `test/rest-client/subscription-checkout/contract.http`
- `test/rest-client/financeiro/stripe-connect.http`
- `test/rest-client/booking/payments.http`
- Fluxo completo até ter estúdio/salas: `test/rest-client/flows/signup-to-settings.http` (ou equivalente)

---

## Parte A — Assinatura (Embedded Checkout + webhook)

**Objetivo:** checkout `PENDING_PAYMENT` → após eventos Stripe → `APPROVED` (e estúdio provisionado conforme regra do backend).

1. [ ] **Subir a API** (`yarn start` ou `yarn start:dev`).

2. [ ] **Autenticar assinante** (`USER`): obter JWT (ex.: `POST /auth/signin`) e colar no REST Client como `@subscriberToken` (ou header `Authorization: Bearer ...`).

3. [ ] **Iniciar checkout de assinatura**  
   `POST /subscription-checkout/start` (payload conforme DTO do projeto).  
   Anotar `checkout.id` → variável `@checkoutId`.

4. [ ] **Consultar checkout**  
   `GET /subscription-checkout/{{checkoutId}}` → status esperado `PENDING_PAYMENT`.

5. [ ] **Criar sessão Stripe (Embedded)**  
   `POST /subscription-checkout/{{checkoutId}}/stripe/session`  
   Resposta deve incluir `clientSecret` / `sessionId` (nomes exatos conforme Swagger).

6. [ ] **Webhook — encaminhar para a API local** (terminal separado):

   ```bash
   stripe listen --forward-to http://localhost:4000/payments/stripe/webhook
   ```

   Copiar o **`whsec_...`** para `STRIPE_WEBHOOK_SECRET` e **reiniciar a API** se necessário.

7. [ ] **Disparar fluxo de pagamento de teste**  
   - Opção 1: completar o pagamento no **Embedded Checkout** do front (modo teste).  
   - Opção 2: `stripe trigger checkout.session.completed` (e/ou eventos que o backend trate: `invoice.paid`, etc.) — **só funciona** se o handler do backend aceitar o payload gerado e se `metadata`/IDs baterem com a sessão criada. Para validação fiel, prefira o fluxo real do Checkout.

8. [ ] **Conferir webhook na API**  
   Resposta tipo `received: true` (ou equivalente) e **sem erro** nos logs.

9. [ ] **Idempotência**  
   Reenviar o **mesmo** evento (mesmo `event id`): não deve duplicar efeitos (tabela de eventos Stripe no banco).

10. [ ] **Estado final do checkout**  
    `GET /subscription-checkout/{{checkoutId}}` → `APPROVED` (e `studioId` preenchido, se aplicável ao seu fluxo).

**Cenários negativos mínimos**

- [ ] Webhook **sem** header `stripe-signature` → `400`.
- [ ] Usuário **sem vínculo** com o checkout tentando criar sessão Stripe de outro checkout → `403`.
- [ ] Checkout já **APPROVED** tentando nova sessão → `400` (ou regra equivalente documentada no Swagger).

---

## Parte B — Stripe Connect (don do estúdio)

**Objetivo:** assinante com estúdio vincula conta **Express** para receber pagamentos de reservas.

1. [ ] **Autenticar** como dono do estúdio (`USER` assinante com `studioId`) ou papel que a rota exige — conferir `@ApiTags` / guards no `FinanceStripeController`.

2. [ ] **Criar link de onboarding**  
   `POST .../financeiro/studios/{{studioId}}/stripe/connect` (path exato no `stripe-connect.http`).  
   Abrir URL retornada no navegador e **completar** o onboarding Stripe (modo teste).

3. [ ] **Status Connect**  
   `GET .../financeiro/studios/{{studioId}}/stripe/status`  
   Conferir campos persistidos no `Studio`: conta conectada, `chargesEnabled` / `payoutsEnabled` quando aplicável.

4. [ ] **Webhook `account.updated`** (Stripe CLI ou evento real)  
   Status no banco/API deve refletir atualização da conta conectada.

5. [ ] **Link do Express Dashboard** (se implementado)  
   `POST .../dashboard-link` → URL temporária para o dono gerenciar a conta.

**Cenários negativos**

- [ ] Usuário sem permissão no estúdio → `403`.
- [ ] Studio sem conta conectada ao pedir dashboard link → erro de negócio documentado (ex.: `404` / domínio).

---

## Parte C — Pagamento de reserva (PaymentIntent + Connect)

**Objetivo:** cliente paga reserva; valor vai para conta conectada com taxa da plataforma (`application_fee_amount` + `transfer_data.destination`).

1. [ ] **Ter** estúdio com Connect **habilitado para cobranças** (Parte B ok).

2. [ ] **Criar reserva** pelo fluxo público (ex.: `test/rest-client/booking/public.http`) e anotar `bookingId` e `studioSlug`.

3. [ ] **Criar PaymentIntent**  
   `POST /public/studios/{{studioSlug}}/bookings/{{bookingId}}/payment-intent` (path conforme projeto).  
   Resposta: `clientSecret` para confirmar pagamento no front (Stripe.js) ou fluxo de teste.

4. [ ] **Confirmar pagamento** em modo teste (cartão `4242...` ou fluxo Elements).

5. [ ] **Webhooks**  
   - `payment_intent.succeeded` → reserva marcada como paga (status/`paymentStatus` conforme domínio).  
   - `payment_intent.payment_failed` → reserva falha / estado esperado.

6. [ ] **Idempotência** do webhook (mesmo evento não processa duas vezes).

---

## Ordem sugerida (smoke E2E completo)

1. Docker + migrate + API.  
2. Owner global (se precisar aprovar algo) + assinante + checkout assinatura → webhook → `APPROVED`.  
3. Cadastro de salas (`settings/rooms` ou fluxo `signup-to-settings`).  
4. Connect onboarding + status.  
5. Reserva pública + PaymentIntent + webhooks de pagamento.

---

## URLs e portas (ajuste ao seu ambiente)

| Uso              | Exemplo local        |
|------------------|----------------------|
| API              | `http://localhost:4000` |
| Webhook Stripe   | `POST http://localhost:4000/payments/stripe/webhook` |
| Stripe CLI       | `stripe listen --forward-to ...` |

Produção: substituir por `https://api.reservaestudio.com.br` (ou seu domínio) e registrar o endpoint no **Stripe Dashboard → Webhooks**.

---

## Critérios de sucesso (resumo)

- [ ] Sessão embedded retorna dados necessários para montar o Checkout no front.
- [ ] Webhook de assinatura atualiza checkout e provisiona estúdio conforme regra.
- [ ] Connect: onboarding gera conta; status e webhooks mantêm o `Studio` coerente.
- [ ] PaymentIntent de reserva usa destino Connect + taxa da plataforma; webhooks atualizam a reserva.
- [ ] Reprocessar o mesmo `event.id` não duplica alterações.

---

## Se a API não sobe por falta de Stripe

Garanta **todas** as variáveis obrigatórias no `.env` (chave secreta, webhook secret em dev, e **todos** os Price IDs). O Nest pode instanciar os serviços Stripe na subida e falhar se faltar `STRIPE_SECRET_KEY`.

---

*Última revisão conceitual: Fase 2 Stripe (ReservaEstudio Backend). Ajuste paths exatos pelos controllers/DTOs do repositório atual (`Swagger` em `/api` ou rota configurada no `main.ts`).*
