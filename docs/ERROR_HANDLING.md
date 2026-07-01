# Xử lý lỗi

## Định dạng error response

Đang chờ bổ sung.

- Chưa có custom exception filter hoặc global error formatter trong `src`.
- Runtime hiện dùng default NestJS exception response.

## Định dạng validation error

- Global validation được bật qua `ValidationPipe` trong `src/main.ts`.
- Options hiện dùng:
  - `whitelist: true`
  - `transform: true`
  - `forbidNonWhitelisted: true`
- Auth request DTO đã dùng `class-validator`.
- Request DTO cho domain khác Đang chờ bổ sung.

## Exception filter

Chưa triển khai.

## Quy ước business error

Triển khai một phần cho auth bằng NestJS built-in exceptions. Chưa có custom error-code envelope.

## Quy ước message

- Message auth trả client phải là tiếng Việt.
- Message lỗi auth nằm trong `src/common/messages/ERROR.ts`.
- Message thông tin/thành công auth nằm trong `src/common/messages/INFO.ts`.
- Service/controller/guard/repository không hardcode message trả client.

## Error code dùng chung nếu có

Đang chờ bổ sung.

Quan sát từ source:

- Startup có thể fail với Joi config validation error khi thiếu env vars.
- Chưa có domain-specific error code enum hoặc shared exception helper.

## Các trường hợp lỗi auth

Auth hiện trả NestJS default exception response cho các case:

- Google token invalid hoặc expired: `401 Unauthorized`
- Google email chưa verify: `401 Unauthorized`
- User inactive hoặc suspended: `401 Unauthorized`
- Thiếu hoặc sai bearer token: `401 Unauthorized`
- Access token invalid: `401 Unauthorized`
- Refresh token invalid: `401 Unauthorized`
- Refresh token expired: `401 Unauthorized`
- Session not found khi token validation: `401 Unauthorized`
- Session revoked: `401 Unauthorized`
- Session expired: `401 Unauthorized`
- Dùng lại refresh token cũ: `401 Unauthorized`; session bị revoke với `reuse_detected`
- Revoke session không thuộc user hiện tại: `404 Not Found`
- `sessionId` path parameter không hợp lệ: `400 Bad Request`

## Giả định

- Validation và exception payload shape theo default NestJS vì source hiện chưa override.
