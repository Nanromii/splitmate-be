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
- Expense split hiện chỉ hỗ trợ `EQUAL`.

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

## Expense APIs

| Method   | Path                                   | Auth   | Mục đích                                 | Request chính                                                                                           | Response chính                       |
| -------- | -------------------------------------- | ------ | ---------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `POST`   | `/groups/:groupId/expenses`            | Bearer | Tạo expense trong group bằng equal split | `title`, `amount`, `paidByUserId`, `participantIds`, optional `description`, `expenseDate`, `splitType` | Expense detail kèm splits            |
| `GET`    | `/groups/:groupId/expenses`            | Bearer | Lấy danh sách expense trong group        | `groupId` là UUID v7                                                                                    | Danh sách expense không phân trang   |
| `GET`    | `/groups/:groupId/expenses/:expenseId` | Bearer | Lấy chi tiết expense                     | `groupId`, `expenseId` là UUID v7                                                                       | Expense detail kèm splits            |
| `PATCH`  | `/groups/:groupId/expenses/:expenseId` | Bearer | Cập nhật expense                         | Optional `title`, `description`, `amount`, `paidByUserId`, `participantIds`, `expenseDate`, `splitType` | Expense detail kèm splits sau update |
| `DELETE` | `/groups/:groupId/expenses/:expenseId` | Bearer | Xóa mềm expense và splits liên quan      | `groupId`, `expenseId` là UUID v7                                                                       | Message xóa expense thành công       |

### Request mẫu

Tạo expense equal split:

```json
{
  "title": "Dinner",
  "description": "Team dinner after workshop",
  "amount": 100000,
  "paidByUserId": "01980000-0000-7000-8000-000000000001",
  "participantIds": [
    "01980000-0000-7000-8000-000000000001",
    "01980000-0000-7000-8000-000000000002",
    "01980000-0000-7000-8000-000000000003"
  ],
  "expenseDate": "2026-07-02T10:00:00.000Z",
  "splitType": "EQUAL"
}
```

Cập nhật expense và tính lại splits:

```json
{
  "amount": 120000,
  "participantIds": [
    "01980000-0000-7000-8000-000000000001",
    "01980000-0000-7000-8000-000000000002"
  ]
}
```

### Ghi chú Expense

- Tất cả expense APIs yêu cầu current user là active member của group.
- `paidByUserId` và toàn bộ `participantIds` phải là active members của group.
- `amount` phải lớn hơn `0`.
- `participantIds` không được rỗng và không được trùng user.
- `splitType` hiện chỉ hỗ trợ `EQUAL`; nếu không truyền thì mặc định dùng `EQUAL`.
- Equal split chia số nguyên theo tổng amount; phần dư được cộng `+1` lần lượt cho các participant đầu tiên để tổng split luôn bằng amount.
- Currency của expense lấy từ currency hiện tại của group.
- Field `description` trong API đang map vào column `note` của entity.
- `GET /groups/:groupId/expenses` hiện chưa có pagination.
- `DELETE /groups/:groupId/expenses/:expenseId` hiện soft delete expense và splits liên quan.

## APIs chưa triển khai

- Settlement APIs: Chưa triển khai.
- Balance/simplified debt APIs: Chưa triển khai.
- Custom split APIs ngoài `EQUAL`: Chưa triển khai.
- Redis/application cache APIs: Chưa triển khai.
- File upload APIs: Chưa triển khai.
- Notification APIs: Chưa triển khai.
- Middleware/interceptor custom APIs hoặc behavior: Chưa triển khai.
