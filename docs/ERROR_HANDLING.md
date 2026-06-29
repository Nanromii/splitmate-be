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

Partially implemented for auth through NestJS built-in exceptions. No custom error-code envelope exists yet.

## Common error codes if available

Pending.

Observed source behavior:

- Startup can fail with Joi config validation errors when required env vars are missing.
- No domain-specific error code enum or shared exception helper was found.

## Auth error cases

Auth currently returns NestJS default exception responses for these cases:

- Google token invalid or expired: `401 Unauthorized`
- Google email not verified: `401 Unauthorized`
- User inactive or suspended: `401 Unauthorized`
- Missing or malformed bearer token: `401 Unauthorized`
- Invalid access token: `401 Unauthorized`
- Refresh token invalid: `401 Unauthorized`
- Refresh token expired: `401 Unauthorized`
- Session not found during token validation: `401 Unauthorized`
- Session revoked: `401 Unauthorized`
- Session expired: `401 Unauthorized`
- Reused old refresh token: `401 Unauthorized`; the session is revoked with `reuse_detected`
- Revoke session not owned by current user: `404 Not Found`
- Invalid `sessionId` path parameter: `400 Bad Request`

## Assumptions

- Validation and exception payload shapes are assumed to be NestJS defaults because the current source does not override them.
