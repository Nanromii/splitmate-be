# SplitMate Backend

## Project overview

SplitMate is a NestJS backend project for an expense-sharing domain. The current source code contains application bootstrap, environment and database configuration, domain entities, custom repositories, and Google-only authentication with JWT access/refresh tokens and session management. Other business modules such as groups, expenses, settlements, interceptors, and middleware are still not implemented yet in `src`.

## Tech stack

- NestJS 11
- TypeScript 5
- TypeORM
- PostgreSQL
- Redis
- Swagger
- Joi for env validation
- Jest + Supertest
- ESLint + Prettier

## Requirements

- Node.js is required. Exact version is Pending because no `engines` field is defined in `package.json`.
- pnpm is required to run the project scripts.
- PostgreSQL and Redis are required by the current env validation schema.

## Quick start

1. Install dependencies with pnpm.
2. Create `.env.development.local` from `env.example`.
3. Start PostgreSQL and Redis using the repository `docker-compose.yml`.
4. Run the development server with `pnpm start:dev`.

## Environment variables

Validated by `src/configs/env-validation.config.ts`:

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

- Auth uses separate access and refresh token secrets. `JWT_SECRET` is no longer validated by the current source.

## Available scripts

- `pnpm build`: Build the NestJS app into `dist/`.
- `pnpm format`: Run Prettier on `src/**/*.ts` and `test/**/*.ts`.
- `pnpm start`: Start the app with Nest CLI.
- `pnpm start:dev`: Start the app in watch mode with `NODE_ENV=development`.
- `pnpm start:prod`: Run the compiled app with `NODE_ENV=production`.
- `pnpm start:debug`: Start the app in debug watch mode.
- `pnpm lint`: Run ESLint with `--fix`.
- `pnpm test`: Run unit tests.
- `pnpm test:watch`: Run unit tests in watch mode.
- `pnpm test:cov`: Run tests with coverage.
- `pnpm test:debug`: Run Jest in debug mode.
- `pnpm test:e2e`: Run end-to-end tests.

## Swagger/API docs

- Global API prefix: `/api/v1`
- Swagger UI path: `/api/docs`
- Swagger title: `SplitMate API`
- Swagger description: `SplitMate Backend API`
- Swagger bearer auth is registered globally.

Current status:

- Swagger is configured in `src/main.ts`.
- Auth endpoints are implemented under `/api/v1/auth`.
- Other domain endpoints are Pending.

## Project structure

```text
splitmate/
├─ src/
│  ├─ common/
│  │  ├─ enums/
│  │  └─ messages/            # empty
│  ├─ configs/
│  ├─ database/
│  ├─ modules/
│  │  ├─ auth/
│  │  ├─ repositories/
│  │  ├─ sessions/
│  │  └─ users/
│  ├─ redis/                  # empty
│  ├─ app.controller.ts
│  ├─ app.module.ts
│  ├─ app.service.ts
│  └─ main.ts
├─ test/
├─ docker/
├─ env.example
├─ docker-compose.yml
└─ docs/
```

## Useful links or notes

- Detailed project docs live under `docs/`.
- `docker-compose.yml` defines PostgreSQL and Redis for local development.
- `pnpm build` currently passes.
- `pnpm test` currently passes.
- `pnpm test:e2e` currently passes with a focused auth routing spec.

## Assumptions

- Dependency installation is expected to be done with pnpm because the repository contains `pnpm-lock.yaml`, but `package.json` does not declare a `packageManager` field.
