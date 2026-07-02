# Danh sách API hiện có

## Quy ước chung

- Base URL local: `http://localhost:{PORT}/api/v1`
- Swagger UI: `http://localhost:{PORT}/api/docs`
- Protected API yêu cầu header:

```http
Authorization: Bearer <accessToken>
```

- Runtime hiện dùng default NestJS response shape, chưa có global response wrapper.
- Validation hiện dùng global `ValidationPipe` với `whitelist`, `transform` và `forbidNonWhitelisted`.
- Pagination hiện chỉ triển khai cho `GET /groups`.

## Auth APIs

| Method   | Path                        | Auth   | Mục đích                                     | Request chính                                | Response chính                                                |
| -------- | --------------------------- | ------ | -------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------- |
| `POST`   | `/auth/google/login`        | Public | Đăng nhập bằng Google ID token               | `idToken`, optional `deviceId`, `deviceName` | User, `accessToken`, `refreshToken`, `sessionId`, `expiresIn` |
| `POST`   | `/auth/refresh`             | Public | Làm mới access token và rotate refresh token | `refreshToken`                               | User, token pair mới, `sessionId`, `expiresIn`                |
| `POST`   | `/auth/logout`              | Bearer | Thu hồi session hiện tại                     | Không có body                                | `{ "revoked": true }`                                         |
| `POST`   | `/auth/logout-all`          | Bearer | Thu hồi toàn bộ session của current user     | Không có body                                | `{ "revoked": true }`                                         |
| `GET`    | `/auth/sessions`            | Bearer | Lấy danh sách session của current user       | Không có body                                | Danh sách session, không trả `refreshTokenHash`               |
| `DELETE` | `/auth/sessions/:sessionId` | Bearer | Thu hồi một session thuộc current user       | `sessionId` là UUID v7                       | `{ "revoked": true }`                                         |
| `GET`    | `/auth/me`                  | Bearer | Lấy thông tin user đang đăng nhập            | Không có body                                | User profile an toàn cho client                               |

### Ghi chú Auth

- Auth hiện chỉ hỗ trợ Google login.
- Username/password login, password reset và email verification endpoints Chưa triển khai.
- `POST /auth/refresh` là public route nhưng vẫn yêu cầu refresh token hợp lệ trong body.
- Các protected auth endpoints dùng `JwtAuthGuard`.

## Group APIs

| Method   | Path                              | Auth   | Mục đích                                | Request chính                              | Response chính                              |
| -------- | --------------------------------- | ------ | --------------------------------------- | ------------------------------------------ | ------------------------------------------- |
| `POST`   | `/groups`                         | Bearer | Tạo nhóm chi tiêu                       | `name`, optional `description`, `currency` | Group vừa tạo, current user có role `OWNER` |
| `GET`    | `/groups`                         | Bearer | Lấy danh sách nhóm của current user     | Query `page`, `limit`                      | `{ items, meta }`                           |
| `GET`    | `/groups/:groupId`                | Bearer | Lấy chi tiết một nhóm                   | `groupId` là UUID v7                       | Group detail                                |
| `PATCH`  | `/groups/:groupId`                | Bearer | Cập nhật thông tin nhóm                 | Optional `name`, `description`, `currency` | Group sau khi update                        |
| `DELETE` | `/groups/:groupId`                | Bearer | Xóa mềm nhóm                            | `groupId` là UUID v7                       | Message xóa nhóm thành công                 |
| `POST`   | `/groups/:groupId/leave`          | Bearer | Rời nhóm                                | `groupId` là UUID v7                       | Message rời nhóm thành công                 |
| `GET`    | `/groups/:groupId/members`        | Bearer | Lấy danh sách active members trong nhóm | `groupId` là UUID v7                       | Danh sách members không có field nhạy cảm   |
| `POST`   | `/groups/:groupId/members`        | Bearer | Thêm hoặc kích hoạt lại thành viên      | Body `userId` là UUID v7                   | Member vừa được thêm/kích hoạt              |
| `POST`   | `/groups/:groupId/transfer-owner` | Bearer | Chuyển quyền chủ nhóm                   | Body `newOwnerUserId` là UUID v7           | Message chuyển quyền thành công             |

### Request mẫu

Tạo nhóm:

```json
{
  "name": "Trip to Da Nang",
  "description": "Nhóm chi tiêu cho chuyến đi Đà Nẵng",
  "currency": "VND"
}
```

Lấy danh sách nhóm có pagination:

```http
GET /api/v1/groups?page=1&limit=20
```

Cập nhật nhóm:

```json
{
  "name": "Trip to Da Nang 2026",
  "description": "Updated description",
  "currency": "VND"
}
```

Thêm thành viên:

```json
{
  "userId": "01980000-0000-7000-8000-000000000002"
}
```

Chuyển quyền chủ nhóm:

```json
{
  "newOwnerUserId": "01980000-0000-7000-8000-000000000002"
}
```

### Ghi chú Group

- Chỉ active member được xem chi tiết nhóm và danh sách members.
- Chỉ owner được update, delete, thêm member và transfer owner.
- Owner không được rời nhóm khi chưa chuyển quyền sở hữu.
- Thêm lại user từng rời nhóm sẽ kích hoạt lại membership cũ thay vì tạo row mới.
- `GET /groups` chỉ trả nhóm mà current user là active member và không trả group đã soft delete.
- `DELETE /groups/:groupId` hiện soft delete group, không hard delete.

## APIs chưa triển khai

- Expense APIs: Chưa triển khai.
- Expense split APIs: Chưa triển khai.
- Settlement APIs: Chưa triển khai.
- Redis/application cache APIs: Chưa triển khai.
- Middleware/interceptor custom APIs hoặc behavior: Chưa triển khai.
