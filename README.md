# Reserva Estúdio — API (backend)

API **NestJS** + TypeScript + Prisma para o SaaS **Reserva Estúdio** (estúdios, salas, reservas, clientes, assinatura da plataforma e pagamentos via **Mercado Pago** e **Stripe**).

## Documentação útil

- [docs/integracao-mercadopago-reserva-estudio.md](docs/integracao-mercadopago-reserva-estudio.md) — MP neste repositório (webhooks, OAuth, reservas).
- [docs/integracao-mercadopago-gigmanager.md](docs/integracao-mercadopago-gigmanager.md) — referência do produto GigManager (caminhos de código externos).
- Contratos HTTP: [test/rest-client/](test/rest-client/) e [api.http](api.http).
- Swagger em desenvolvimento: `http://localhost:4000/api` (ajuste host/porta conforme `PORT`).

## Setup

```bash
yarn install
```

## Banco de dados (Docker) e ambiente

1. Subir o Postgres:

```bash
docker compose up -d
```

- Container: `reservaestudio-postgres`
- Porta no host: **5433** → `5432` no container
- Banco: `reservaestudio`

2. Variáveis de ambiente:

```bash
cp .env.example .env
```

Edite `.env`: `JWT_SECRET`, `DATABASE_URL`, `FRONTEND_URL`, `BACKEND_URL`, chaves **Mercado Pago** e/ou **Stripe** conforme o fluxo que for usar. Em local, use por exemplo `http://localhost:3000` e `http://localhost:4000`.

3. Migrações:

```bash
npx prisma migrate dev
```

A `DATABASE_URL` padrão do exemplo aponta para `localhost:5433` (alinhado ao `docker-compose.yml`).

## Executar

```bash
yarn start:dev    # watch
yarn start        # sem watch
yarn start:prod   # produção (build prévio)
```

## Testes

```bash
yarn test
yarn test:e2e
yarn test:cov
```

## Build

```bash
yarn build
```

## Deploy

Siga o processo do seu provedor (variáveis de ambiente, `npx prisma migrate deploy`, processo Node/Nest). Documentação geral do framework: [NestJS — Deployment](https://docs.nestjs.com/deployment).

## Licença

UNLICENSED (projeto privado), salvo indicação contrária no repositório.
