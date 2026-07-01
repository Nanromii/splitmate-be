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

Naming cho business endpoint khác Đang chờ bổ sung.

## Quy ước request DTO

- Request DTO nhận input từ client nằm trong `dto/request`.
- Auth request DTO hiện dùng `class-validator`.
- Shared auth type/interface dùng lại giữa controller, service, guard và token verification được gom ở `src/common/types/auth.type.ts` và `src/common/interfaces/auth.interface.ts`.
- Global validation dùng `whitelist`, `transform` và `forbidNonWhitelisted`.

## Quy ước response DTO

- Response DTO trả client nằm trong `dto/response`.
- Không dùng entity trực tiếp làm response.
- Không expose field nhạy cảm như `refreshTokenHash`, `passwordHash`, `deletedAt` hoặc token secret.
- Auth dùng mapper nhỏ trong `src/modules/auth/auth.mapper.ts` để map entity sang response DTO.
- Message trả client không được hardcode trong controller/service/guard/repository; auth message constants nằm trong `src/common/messages`.

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

Chưa triển khai.

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

- Vì ngoài auth chưa có business route handler, naming và payload convention cho domain khác vẫn Đang chờ bổ sung.
