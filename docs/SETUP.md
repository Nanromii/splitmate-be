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
  - `JWT_ACCESS_SECRET`
  - `JWT_ACCESS_EXPIRES_IN`
  - `JWT_REFRESH_SECRET`
  - `JWT_REFRESH_EXPIRES_IN`
  - `GOOGLE_CLIENT_ID`

Important note:

- `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` must be different strong secrets outside local development.
- `GOOGLE_CLIENT_ID` must match the client id used by the frontend to obtain Google ID tokens.

## Database setup

- Database type: PostgreSQL.
- Config is defined in `src/configs/database.config.ts`.
- The application currently relies on TypeORM `synchronize: true`.
- There are no migrations or seeds in the current source tree.
- Auth/session schema changes are applied through TypeORM `synchronize: true` in the current source.

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
- `pnpm test` currently passes.
- `pnpm test:e2e` currently passes with a focused auth routing spec that does not require PostgreSQL.
- Because `synchronize: true` is enabled, schema changes can be applied automatically on startup against the connected database.

## Assumptions

- The provided `docker-compose.yml` is intended for local development because the repository does not include a Dockerfile or an application container definition.
