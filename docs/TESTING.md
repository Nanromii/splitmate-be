# Testing

## Test tools

- Jest
- `@nestjs/testing`
- `ts-jest`
- Supertest

## Unit test command

- `pnpm test`
- `pnpm test:watch`
- `pnpm test:cov`
- `pnpm test:debug`

## E2E test command

- `pnpm test:e2e`

## Test file naming

- Unit tests: `*.spec.ts`
- E2E tests: `*.e2e-spec.ts`

## Mocking strategy

- Current unit test setup uses Nest `TestingModule`.
- `src/app.controller.spec.ts` uses the real `AppService`.
- Auth tests mock repositories, JWT signing/verification, ConfigService, Google token verification, and the ESM-only `uuid` dependency.

## What should be tested

- Bootstrap and configuration behavior
- Entity mapping and repository behavior
- Future controller, service, auth, and validation flows once implemented
- Env validation behavior for each runtime mode

## Current status

- `pnpm build`: passes.
- `pnpm test`: passes.
- `pnpm test:e2e`: passes with a focused auth routing spec.

## Current auth coverage

- Google login creates a user, session, and token pair.
- Refresh token success rotates the stored refresh token hash.
- Reusing an old refresh token revokes the session.
- Logout revokes the current session.
- Logout all revokes active sessions for the current user.
- Revoke session blocks sessions outside the current user scope.
- Invalid access tokens are rejected.
- E2E verifies `POST /api/v1/auth/refresh` routing and `GET /api/v1/auth/me` bearer-token enforcement.

## Assumptions

- The existing tests still look like starter-template tests and have not been updated to match the current source structure.
