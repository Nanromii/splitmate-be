# Architecture

## System overview

The current application is a single NestJS service. `src/main.ts` bootstraps the app, enables CORS, registers a global `ValidationPipe`, sets the global prefix to `api/v1`, and exposes Swagger at `api/docs`. `src/app.module.ts` wires together global config, TypeORM, and the repository module.

## Main modules

- `AppModule`: root module.
- `ConfigModule`: global environment loading and Joi validation.
- `TypeOrmModule`: PostgreSQL connection setup.
- `RepositoriesModule`: custom repositories for `User`, `Expense`, `Group`, `GroupMember`, and `Settlement`.
- `src/database`: entity definitions for the SplitMate domain.
- `src/common/enums`: shared enum definitions.

## Request flow

1. A request enters the Nest application.
2. Global prefix `api/v1` is applied.
3. Global `ValidationPipe` runs with `whitelist`, `transform`, and `forbidNonWhitelisted`.
4. The request would be handled by a controller.
5. Controllers would call services or repositories.
6. Repositories use TypeORM against PostgreSQL.

Current status:

- Steps 1 to 3 are implemented in `src/main.ts`.
- Business request handlers are Pending because the current `src/app.controller.ts` has no route methods and there are no feature controllers in `src`.

## Layer responsibilities

- `src/main.ts`: bootstrap and global app behavior.
- `src/app.module.ts`: module composition.
- `src/configs`: env validation and database configuration.
- `src/database`: entity mapping and relation metadata.
- `src/modules/repositories`: data access layer.
- `src/common/enums`: shared domain constants.

## Dependency direction

- `main.ts` depends on `AppModule`.
- `AppModule` depends on `configs` and `RepositoriesModule`.
- `RepositoriesModule` depends on `src/database`.
- Entities depend on `src/common/enums` and other entities for relations.

## External services

- PostgreSQL: configured and used through TypeORM.
- Redis: env vars and Docker service exist, but application integration is Not implemented yet.
- Swagger UI: enabled inside the Nest app.

## Important architectural decisions

- Environment is loaded from `.env.${NODE_ENV || 'development'}.local`.
- Env validation uses Joi at startup.
- TypeORM uses `autoLoadEntities: true`.
- TypeORM uses `synchronize: true`.
- Data access is currently expressed through custom repository classes instead of feature services.

## Assumptions

- The intended architecture appears to be module-based NestJS with domain repositories first, but feature modules and service/controller layers are still Pending in the current source tree.
