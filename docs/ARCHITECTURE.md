# Architecture

## System overview

The current application is a single NestJS service. `src/main.ts` bootstraps the app, enables CORS, registers a global `ValidationPipe`, sets the global prefix to `api/v1`, and exposes Swagger at `api/docs`. `src/app.module.ts` wires together global config, TypeORM, the repository module, users/sessions scaffolds, and the auth module.

## Main modules

- `AppModule`: root module.
- `ConfigModule`: global environment loading and Joi validation.
- `TypeOrmModule`: PostgreSQL connection setup.
- `RepositoriesModule`: custom repositories for `User`, `Expense`, `Group`, `GroupMember`, and `Settlement`.
- `AuthModule`: Google login, JWT access/refresh tokens, session management, auth guard, and auth DTOs.
- `UsersModule`: scaffold only.
- `SessionsModule`: scaffold only.
- `src/database`: entity definitions for the SplitMate domain.
- `src/common/enums`: shared enum definitions.

## Request flow

1. A request enters the Nest application.
2. Global prefix `api/v1` is applied.
3. Global `ValidationPipe` runs with `whitelist`, `transform`, and `forbidNonWhitelisted`.
4. Public auth routes use `@Public()`; protected auth routes use `JwtAuthGuard`.
5. Controllers call services.
6. Services use repositories.
7. Repositories use TypeORM against PostgreSQL.

Current status:

- Steps 1 to 3 are implemented in `src/main.ts`.
- Auth request handlers are implemented in `src/modules/auth/auth.controller.ts`.
- Other business request handlers are Pending.

## Layer responsibilities

- `src/main.ts`: bootstrap and global app behavior.
- `src/app.module.ts`: module composition.
- `src/configs`: env validation and database configuration.
- `src/database`: entity mapping and relation metadata.
- `src/modules/auth`: Google auth endpoints, token/session service logic, guard, DTOs, and Google token verification.
- `src/modules/repositories`: data access layer.
- `src/common/enums`: shared domain constants.

## Dependency direction

- `main.ts` depends on `AppModule`.
- `AppModule` depends on `configs`, `RepositoriesModule`, `AuthModule`, `UsersModule`, and `SessionsModule`.
- `AuthModule` depends on `RepositoriesModule`, `JwtModule`, and global config.
- `RepositoriesModule` depends on `src/database`.
- Entities depend on `src/common/enums` and other entities for relations.

## External services

- PostgreSQL: configured and used through TypeORM.
- Google OAuth tokeninfo endpoint: used during Google ID-token login.
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
