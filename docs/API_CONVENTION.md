# Quy ước API

## Base URL

- Local base URL: `http://localhost:{PORT}/api/v1`
- Global prefix được cấu hình bằng `app.setGlobalPrefix('api/v1')`

## Phiên bản API

- Versioning hiện dùng path-based thông qua global prefix.
- Chưa cấu hình thêm Nest versioning strategy.

## Quy ước đặt tên endpoint

Auth endpoints đã triển khai dưới `/auth`:

- `POST /auth/google/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `POST /auth/logout-all`
- `GET /auth/sessions`
- `DELETE /auth/sessions/:sessionId`
- `GET /auth/me`

Group management endpoints đã triển khai dưới `/groups`:

- `POST /groups`
- `GET /groups`
- `GET /groups/:groupId`
- `PATCH /groups/:groupId`
- `DELETE /groups/:groupId`
- `POST /groups/:groupId/leave`
- `GET /groups/:groupId/members`
- `POST /groups/:groupId/members`
- `POST /groups/:groupId/transfer-owner`

Expense equal split endpoints đã triển khai dưới `/groups/:groupId/expenses`:

- `POST /groups/:groupId/expenses`
- `GET /groups/:groupId/expenses`
- `GET /groups/:groupId/expenses/:expenseId`
- `PATCH /groups/:groupId/expenses/:expenseId`
- `DELETE /groups/:groupId/expenses/:expenseId`

Naming cho settlement và business endpoint khác Đang chờ bổ sung.

## Quy ước request DTO

- Request DTO nhận input từ client nằm trong `dto/request`.
- Auth request DTO hiện dùng `class-validator`.
- Group request DTO hiện dùng `class-validator`.
- Expense request DTO hiện dùng `class-validator`.
- Shared auth type/interface dùng lại giữa controller, service, guard và token verification được gom ở `src/common/types/auth.type.ts` và `src/common/interfaces/auth.interface.ts`.
- Global validation dùng `whitelist`, `transform` và `forbidNonWhitelisted`.

## Quy ước response DTO

- Response DTO trả client nằm trong `dto/response`.
- Không dùng entity trực tiếp làm response.
- Không expose field nhạy cảm như `refreshTokenHash`, `passwordHash`, `deletedAt` hoặc token secret.
- Auth dùng mapper nhỏ trong `src/modules/auth/auth.mapper.ts` để map entity sang response DTO.
- Groups dùng mapper nhỏ trong `src/modules/groups/groups.mapper.ts` để map entity sang response DTO.
- Expenses dùng mapper nhỏ trong `src/modules/expenses/expenses.mapper.ts` để map entity sang response DTO.
- Message trả client không được hardcode trong controller/service/guard/repository; auth/group/expense message constants nằm trong `src/common/messages`.

## Định dạng response

- Chưa có global response wrapper hoặc response interceptor.
- Runtime hiện theo default NestJS controller return shape.

Auth token response trả:

- `user`
- `accessToken`
- `refreshToken`
- `sessionId`
- `expiresIn`

Session list response không trả `refreshTokenHash`.

## Header xác thực

Protected endpoints yêu cầu:

```http
Authorization: Bearer <accessToken>
```

## Định dạng phân trang

Triển khai một phần cho `GET /groups`.

Query hiện hỗ trợ:

- `page`: số trang, mặc định `1`.
- `limit`: số lượng item trên mỗi trang, mặc định `20`, tối đa `100`.

Response hiện có dạng:

```json
{
  "items": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

`GET /groups` sort theo `createdAt DESC` từ repository. `GET /groups/:groupId/expenses` hiện trả danh sách không phân trang, sort theo `expenseDate DESC`, sau đó `createdAt DESC`.

## Quy ước Swagger

- Swagger được tạo trong `src/main.ts`.
- UI path: `/api/docs`
- Title: `SplitMate API`
- Description: `SplitMate Backend API`
- Version: `1.0`
- Bearer auth được đăng ký toàn cục.
- Auth controller methods dùng Swagger decorators.
- Protected methods dùng bearer auth metadata.
- Text mô tả Swagger trong auth ưu tiên tiếng Việt.

## Giả định

- Vì ngoài auth, groups và expenses chưa có business route handler, naming và payload convention cho settlement vẫn Đang chờ bổ sung.
