# Deployment

## Build command

- `pnpm build`

## Production env

- The production start script is `pnpm start:prod`.
- `src/app.module.ts` loads `.env.production.local` when `NODE_ENV=production`.
- Required env vars are validated by Joi at startup.

Important note:

- The current validation schema expects `JWT_SECRET`.
- `.env.production.local` currently defines `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` instead.

## Docker/deployment notes

- The repository includes `docker-compose.yml` for PostgreSQL and Redis only.
- No Dockerfile was found for the application itself.
- No deployment manifests or CI/CD deployment config were found in the current source tree.

## Migration before deployment

Pending.

- No migration command exists in `package.json`.
- No migration files were found.
- The current code relies on TypeORM `synchronize: true`.

## Health check

Not implemented yet.

- No health controller or dedicated health endpoint was found.

## Release checklist

- Run `pnpm build`.
- Run `pnpm test`.
- Run `pnpm test:e2e`.
- Verify production env variables match the current validation schema.
- Verify PostgreSQL and Redis are reachable from the target environment.
- Review the impact of `synchronize: true` before production startup.

## Assumptions

- The deployment target is Pending because no platform-specific deployment configuration exists in the repository.
