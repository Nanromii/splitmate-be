# SplitMate Backend

## Project overview

SplitMate is a NestJS backend project for an expense-sharing domain. The current source code mainly contains application bootstrap, environment and database configuration, domain entities, and a small set of custom repositories. Business modules such as auth, users, groups, expenses, settlements, controllers, DTOs, guards, interceptors, and middleware are not implemented yet in `src`.

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
- `JWT_SECRET`

Present in `env.example`:

- `JWT_ACCESS_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`

Present in `.env.development.local` and `.env.production.local`:

- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_ACCESS_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`

Important note:

- The current env validation schema expects `JWT_SECRET`, but the local env files define `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`. This is an actual inconsistency in the current source.

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
- No business controllers or route handlers are implemented in `src`, so there are no confirmed domain endpoints yet.

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
│  │  └─ repositories/
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
- `pnpm test` currently fails because `src/app.controller.spec.ts` still expects `AppController.getHello()`, but that method is not implemented in `src/app.controller.ts`.
- `pnpm test:e2e` currently fails during bootstrap because config validation does not receive the required env values in the current test setup.

## Assumptions

- Dependency installation is expected to be done with pnpm because the repository contains `pnpm-lock.yaml`, but `package.json` does not declare a `packageManager` field.
