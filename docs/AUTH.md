# Auth

## Authentication method

SplitMate currently supports Google login only. Username/password login, password reset, email verification endpoints, and additional OAuth providers are Not implemented yet.

## Google login flow

1. Client obtains a Google ID token for the configured `GOOGLE_CLIENT_ID`.
2. Client calls `POST /api/v1/auth/google/login` with `idToken`.
3. Backend verifies the Google token through Google's tokeninfo endpoint and checks:
   - audience matches `GOOGLE_CLIENT_ID`
   - token has a subject
   - token has a verified email
   - token is not expired
4. Backend finds a user by Google provider account id or email.
5. If the user does not exist, backend creates a Google user with `password_hash = NULL`.
6. If the user exists, backend updates Google profile fields when appropriate.
7. Backend creates a new session.
8. Backend returns the user, access token, refresh token, session id, and access token lifetime.

## JWT and refresh token strategy

- Access token:
  - JWT signed with `JWT_ACCESS_SECRET`
  - short-lived, configured by `JWT_ACCESS_EXPIRES_IN`
  - payload includes `sub`, `sessionId`, `email`, `role`, and `tokenVersion`
  - raw access tokens are not stored
- Refresh token:
  - JWT signed with `JWT_REFRESH_SECRET`
  - long-lived, configured by `JWT_REFRESH_EXPIRES_IN`
  - payload includes the access payload fields plus `type: "refresh"`
  - raw refresh tokens are not stored
  - `sessions.refresh_token_hash` stores a bcrypt hash only

Refresh token rotation is implemented. Every successful refresh issues a new refresh token and replaces the stored hash. Reusing an older refresh token causes the active session to be revoked with `reuse_detected`.

## Session management

Each login creates one row in `sessions`. A user can have multiple sessions.

Session fields used by auth include:

- `id`
- `user_id`
- `refresh_token_hash`
- `token_family`
- `status`
- `device_id`
- `device_name`
- `user_agent`
- `ip_address`
- `last_activity_at`
- `expires_at`
- `revoked_at`
- `revoke_reason`
- audit fields from the shared local base entity

`last_activity_at` is returned to clients as `lastUsedAt`.

## Guards and public routes

Protected auth endpoints use `JwtAuthGuard`. The guard verifies the access token, checks that the user exists and is active, and checks that the token session is active and not expired or revoked.

Public endpoints use `@Public()`:

- `POST /auth/google/login`
- `POST /auth/refresh`

## Endpoints

- `POST /api/v1/auth/google/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/logout-all`
- `GET /api/v1/auth/sessions`
- `DELETE /api/v1/auth/sessions/:sessionId`
- `GET /api/v1/auth/me`

Protected endpoints require:

```http
Authorization: Bearer <accessToken>
```

## User status rules

Only users with `status = active` can authenticate or call protected endpoints. Google login activates a new Google user and activates an existing `pending_verification` user after Google verifies the email. `inactive` and `suspended` users are rejected.

## Security notes

- No username/password login is implemented.
- Password hashes are not returned.
- Google users are created with `password_hash = NULL`.
- Refresh token hashes are never returned.
- Raw refresh tokens are never stored.
- Old refresh tokens cannot be reused after rotation.
- Access and refresh token secrets are separate env variables.
