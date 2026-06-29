# Setup

## Prerequisites

- Node.js is required. Exact version is Pending because no `engines` field exists in `package.json`.
- pnpm is required to run repository scripts.
- PostgreSQL is required.
- Redis is required by env validation, even though Redis integration is not implemented yet.

## Installation

- Install dependencies with pnpm before running any project scripts.
- No repository-managed bootstrap script is defined in `package.json`.

## Environment setup

- Create `.env.development.local` from `env.example`.
- The application loads `.env.${NODE_ENV || 'development'}.local`.
- The current validation schema requires:
  - `NODE_ENV`
  - `PORT`
  - `DB_HOST`
  - `DB_PORT`
  - `DB_USERNAME`
  - `DB_PASSWORD`
  - `DB_DATABASE`
  - `REDIS_HOST`
  - `REDIS_PORT`
  - `JWT_SECRET`

Important note:

- `env.example` defines `JWT_SECRET`.
- `.env.development.local` and `.env.production.local` define `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` instead.
- This mismatch is present in the current source and should be resolved before implementing auth.

## Database setup

- Database type: PostgreSQL.
- Config is defined in `src/configs/database.config.ts`.
- The application currently relies on TypeORM `synchronize: true`.
- There are no migrations or seeds in the current source tree.

## Redis/Docker setup

- `docker-compose.yml` defines:
  - `postgres` using `postgres:16`
  - `redis` using `redis:7-alpine`
- Redis is only provisioned at infrastructure level right now. No Redis module or Redis service implementation was found in `src`.

## Migration/seed commands

Not implemented yet.

## Run local

- Use `pnpm start:dev` for local development.
- Use `pnpm start` to start via Nest CLI without the development `NODE_ENV` wrapper.

## Troubleshooting

- If env variables are missing, startup fails during Joi validation.
- `pnpm test:e2e` currently fails during app bootstrap because the current test setup does not satisfy config validation.
- `pnpm test` currently fails because `src/app.controller.spec.ts` expects `AppController.getHello()`, but `src/app.controller.ts` does not implement that method.
- Because `synchronize: true` is enabled, schema changes can be applied automatically on startup against the connected database.

## Assumptions

- The provided `docker-compose.yml` is intended for local development because the repository does not include a Dockerfile or an application container definition.
