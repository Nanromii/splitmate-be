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
- No dedicated mocking utilities, factories, or fixtures were found.

## What should be tested

- Bootstrap and configuration behavior
- Entity mapping and repository behavior
- Future controller, service, auth, and validation flows once implemented
- Env validation behavior for each runtime mode

## Current status

- `pnpm build`: passed during this documentation update.
- `pnpm test`: currently fails because `src/app.controller.spec.ts` expects `AppController.getHello()`, but the method is missing from `src/app.controller.ts`.
- `pnpm test:e2e`: currently fails during app bootstrap with config validation errors in the current setup.

## Assumptions

- The existing tests still look like starter-template tests and have not been updated to match the current source structure.
