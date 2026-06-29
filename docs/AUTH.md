# Auth

## Authentication method

Not implemented yet.

Current code signals possible future auth work:

- Dependencies include `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`, and `bcrypt`.
- Swagger registers bearer auth globally in `src/main.ts`.
- Env files include JWT-related variables.

## Login flow

Not implemented yet.

## JWT/access token/refresh token strategy

Not implemented yet.

Observed source details:

- `env.example` contains `JWT_SECRET`, `JWT_ACCESS_EXPIRES_IN`, and `JWT_REFRESH_EXPIRES_IN`.
- `.env.development.local` and `.env.production.local` contain `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `JWT_ACCESS_EXPIRES_IN`, and `JWT_REFRESH_EXPIRES_IN`.
- `src/configs/env-validation.config.ts` currently validates only `JWT_SECRET`.

## Guards/strategies/decorators

Not implemented yet.

No auth guards, Passport strategies, custom auth decorators, or auth module were found in `src`.

## Role/permission

- `GroupRole` exists as a domain enum with `OWNER`, `ADMIN`, and `MEMBER`.
- Route-level role/permission enforcement is Not implemented yet.

## Public/private routes

Pending. No current controller method defines an auth boundary because there are no implemented route handlers in `src`.

## User status rules

- `User` has an `isVerified` boolean column.
- Any verification flow or enforcement rule is Not implemented yet.

## Assumptions

- `GroupRole` appears to be a group membership concept, not a working API authorization system in the current codebase.
