# Auth

## Phương thức xác thực

SplitMate hiện chỉ hỗ trợ Google login. Username/password login, password reset, email verification endpoints và OAuth provider khác đều Chưa triển khai.

## Luồng Google login

1. Client lấy Google ID token cho `GOOGLE_CLIENT_ID` đã cấu hình.
2. Client gọi `POST /api/v1/auth/google/login` với `idToken`.
3. Backend verify Google token qua Google tokeninfo endpoint và kiểm tra:
   - audience khớp `GOOGLE_CLIENT_ID`
   - token có subject
   - token có email đã verify
   - token chưa hết hạn
4. Backend tìm user theo Google provider account id hoặc email.
5. Nếu user chưa tồn tại, backend tạo Google user với `password_hash = NULL`.
6. Nếu user đã tồn tại, backend cập nhật Google profile fields khi phù hợp.
7. Backend tạo session mới.
8. Backend trả về user, access token, refresh token, session id và thời hạn access token.

## Chiến lược JWT và refresh token

- Access token:
  - JWT ký bằng `JWT_ACCESS_SECRET`
  - ngắn hạn, cấu hình bởi `JWT_ACCESS_EXPIRES_IN`
  - payload gồm `sub`, `sessionId`, `email`, `role` và `tokenVersion`
  - không lưu raw access token
- Refresh token:
  - JWT ký bằng `JWT_REFRESH_SECRET`
  - dài hạn, cấu hình bởi `JWT_REFRESH_EXPIRES_IN`
  - payload gồm các field của access payload và `type: "refresh"`
  - không lưu raw refresh token
  - `sessions.refresh_token_hash` chỉ lưu bcrypt hash

Refresh token rotation đã triển khai. Mỗi lần refresh thành công sẽ phát refresh token mới và thay hash đang lưu. Dùng lại refresh token cũ sẽ revoke session active với `reuse_detected`.

## Quản lý session

Mỗi lần login tạo một row trong `sessions`. Một user có thể có nhiều session.

Các field session auth đang dùng:

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
- audit fields từ local base entity

`last_activity_at` được trả cho client dưới tên `lastUsedAt`.

## Guard và public routes

Protected auth endpoints dùng `JwtAuthGuard`. Guard verify access token, kiểm tra user tồn tại và active, đồng thời kiểm tra session trong token còn active, chưa expired và chưa revoked.

Public endpoints dùng `@Public()`:

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

Protected endpoints yêu cầu:

```http
Authorization: Bearer <accessToken>
```

## Request/response DTO

- Request DTO nằm trong `src/modules/auth/dto/request`.
- Response DTO nằm trong `src/modules/auth/dto/response`.
- Response không trả `refreshTokenHash`, `passwordHash`, `deletedAt` hoặc token secret.
- Entity không được dùng trực tiếp làm response.

## Quy tắc trạng thái user

Chỉ user có `status = active` được authenticate hoặc gọi protected endpoints. Google login sẽ activate Google user mới và activate user đang `pending_verification` sau khi Google xác nhận email. User `inactive` hoặc `suspended` bị từ chối.

## Ghi chú bảo mật

- Không triển khai username/password login.
- Không trả password hash.
- Google user được tạo với `password_hash = NULL`.
- Không trả refresh token hash.
- Không lưu raw refresh token.
- Refresh token cũ không dùng lại được sau rotation.
- Access token secret và refresh token secret là hai env riêng.
- Message lỗi auth trả client nằm trong `src/modules/auth/messages/ERROR.ts`.
