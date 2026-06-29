# API Convention

## Base URL

- Local base URL pattern: `http://localhost:{PORT}/api/v1`
- Global prefix is configured with `app.setGlobalPrefix('api/v1')`

## API versioning

- Versioning is path-based through the global prefix.
- No additional Nest versioning strategy is configured.

## Endpoint naming

Pending.

- No business controller methods are currently implemented in `src`.
- `src/app.controller.ts` exists but does not expose a route handler.

## Request DTO convention

Not implemented yet.

- No DTO files were found in the current source tree.

## Response format

- No global response wrapper or response interceptor is implemented.
- Current behavior should follow the default NestJS controller return shape.

## Pagination format

Not implemented yet.

## Swagger convention

- Swagger is created in `src/main.ts`.
- UI path: `/api/docs`
- Title: `SplitMate API`
- Description: `SplitMate Backend API`
- Version: `1.0`
- Bearer auth is registered globally.
- No controller-level Swagger decorators were found.

## Assumptions

- Because there are no implemented route handlers yet, naming and payload conventions beyond the global prefix should be treated as Pending.
