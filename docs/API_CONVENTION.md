# API Convention

## Base URL

- Local base URL pattern: `http://localhost:{PORT}/api/v1`
- Global prefix is configured with `app.setGlobalPrefix('api/v1')`

## API versioning

- Versioning is path-based through the global prefix.
- No additional Nest versioning strategy is configured.

## Endpoint naming

Auth endpoints are implemented under `/auth`:

- `POST /auth/google/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `POST /auth/logout-all`
- `GET /auth/sessions`
- `DELETE /auth/sessions/:sessionId`
- `GET /auth/me`

Other business endpoint naming is Pending.

## Request DTO convention

Implemented for auth DTOs with `class-validator`.

Global validation still uses `whitelist`, `transform`, and `forbidNonWhitelisted`.

## Response format

- No global response wrapper or response interceptor is implemented.
- Current behavior should follow the default NestJS controller return shape.

Auth token responses return:

- `user`
- `accessToken`
- `refreshToken`
- `sessionId`
- `expiresIn`

Session list responses do not include `refreshTokenHash`.

## Authentication header

Protected endpoints require:

```http
Authorization: Bearer <accessToken>
```

## Pagination format

Not implemented yet.

## Swagger convention

- Swagger is created in `src/main.ts`.
- UI path: `/api/docs`
- Title: `SplitMate API`
- Description: `SplitMate Backend API`
- Version: `1.0`
- Bearer auth is registered globally.
- Auth controller methods use Swagger decorators and protected methods use bearer auth metadata.

## Assumptions

- Because there are no implemented route handlers yet, naming and payload conventions beyond the global prefix should be treated as Pending.
