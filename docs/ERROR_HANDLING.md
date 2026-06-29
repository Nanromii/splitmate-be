# Error Handling

## Error response format

Pending.

- No custom exception filter or global error formatter was found in `src`.
- Current runtime behavior should follow NestJS default exception responses.

## Validation error format

- Global validation is enabled through `ValidationPipe` in `src/main.ts`.
- Configured options:
  - `whitelist: true`
  - `transform: true`
  - `forbidNonWhitelisted: true`
- No request DTOs are currently implemented, so request validation behavior is mostly Pending at feature level.

## Exception filter

Not implemented yet.

## Business error convention

Not implemented yet.

## Common error codes if available

Pending.

Observed source behavior:

- Startup can fail with Joi config validation errors when required env vars are missing.
- No domain-specific error code enum or shared exception helper was found.

## Assumptions

- Validation and exception payload shapes are assumed to be NestJS defaults because the current source does not override them.
