# AGENTS.md

## Project context

- This repository is a NestJS backend for the SplitMate domain.
- The current source is still at an early scaffold stage.
- The implemented parts are bootstrap code, config, enums, entities, custom repositories, and Google-only auth with JWT/session management.
- Business modules such as groups, expenses, settlements, interceptors, middleware, and message catalogs are Not implemented yet.
- Users and sessions modules currently exist mostly as scaffolds; auth owns the implemented user/session workflow.
- `src/common/messages` and `src/redis` currently exist but are empty.

## Rules for AI coding agents

- Read `src`, `test`, env files, and `package.json` before making assumptions.
- Treat `src` as the source of truth. Do not document or implement features based only on `dist/`.
- Do not claim an endpoint, auth flow, validation rule, or repository exists unless it is present in `src`.
- If a feature is missing from code, document it as `Not implemented yet` or `Pending`.
- Keep docs and code aligned with the current implementation, even if the implementation is incomplete.
- Preserve Google-only authentication unless the user explicitly asks for another login method.
- Do not add username/password login, password reset, or email verification endpoints unless explicitly requested.
- Preserve entity table names, enum values, and relation settings unless the user explicitly asks to change them.
- Call out real inconsistencies in the codebase instead of silently normalizing them.

## Coding conventions

- Use TypeScript and NestJS patterns already present in the repo.
- Follow Prettier settings from `.prettierrc`: single quotes and trailing commas.
- Follow ESLint rules from `eslint.config.mjs`.
- Keep imports explicit and local path structure simple.
- Prefer updating `src/configs`, `src/database`, and `src/modules/repositories` in place instead of inventing parallel abstractions.
- The API bootstrap currently uses a global prefix of `api/v1`, global `ValidationPipe`, CORS, and Swagger setup in `src/main.ts`.

## Folder/module conventions

- `src/configs`: application and environment configuration.
- `src/common/enums`: shared enums used by entities.
- `src/common/messages`: Pending.
- `src/database`: entity definitions and the local shared base entity.
- `src/modules/repositories`: custom repository classes and the repository module.
- `src/modules/auth`: Google login, JWT tokens, session management, auth guard, DTOs, and Google token verification.
- `src/redis`: Pending.
- `test`: e2e tests and Jest e2e config.

## Commands to run before finishing

- Always run `pnpm build`.
- Run `pnpm test` if you changed unit-tested source or test files.
- Run `pnpm test:e2e` if you changed bootstrap, config, routing, or integration behavior.
- Run `pnpm lint` only when you are prepared for auto-fixes, because the script uses `--fix`.

## Things AI must not do

- Do not invent auth guards, JWT strategies, DTOs, controllers, services, or middleware that are not present.
- Do not assume Redis is wired into the application just because Redis env vars and Docker config exist.
- Do not assume migrations exist. The current codebase relies on TypeORM `synchronize: true`.
- Do not use `dist/` to infer missing source behavior unless you explicitly label it as compiled output and verify the source mismatch.
- Do not silently “fix” the JWT env naming mismatch without the user asking for a code change.
- Do not change business logic when the request is documentation-only.

## Commit message convention

Pending. No commit message convention is defined in the current source code.

## Assumptions

- The team intends `src/database/base.entity.ts` to be the shared base entity, but several current entities import `BaseEntity` from `typeorm` instead. Treat that mismatch as an implementation detail to verify before refactoring.
