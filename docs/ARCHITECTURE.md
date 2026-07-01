# Kiến trúc

## Tổng quan hệ thống

Ứng dụng hiện là một NestJS service. `src/main.ts` bootstrap app, bật CORS, đăng ký global `ValidationPipe`, đặt global prefix `api/v1` và mở Swagger tại `api/docs`. `src/app.module.ts` nối global config, TypeORM, repository module, users/sessions scaffold và auth module.

## Module chính

- `AppModule`: root module.
- `ConfigModule`: load environment toàn cục và validate bằng Joi.
- `TypeOrmModule`: kết nối PostgreSQL.
- `RepositoriesModule`: custom repositories cho `User`, `Expense`, `Group`, `GroupMember`, `Settlement` và `Session`.
- `AuthModule`: Google login, JWT access/refresh tokens, session management, auth guard, request/response DTO, mapper và Google token verification.
- `UsersModule`: scaffold.
- `SessionsModule`: scaffold.
- `src/database`: entity definitions cho domain SplitMate.
- `src/common/enums`: enum dùng chung.
- `src/common/types`: shared type dùng chung, hiện gom type theo domain auth.
- `src/common/interfaces`: shared interface dùng chung, hiện gom interface theo domain auth.
- `src/common/messages`: shared message constants trả về client.

## Luồng request

1. Request đi vào Nest application.
2. Global prefix `api/v1` được áp dụng.
3. Global `ValidationPipe` chạy với `whitelist`, `transform` và `forbidNonWhitelisted`.
4. Public auth routes dùng `@Public()`; protected auth routes dùng `JwtAuthGuard`.
5. Controllers gọi services.
6. Services dùng repositories.
7. Repositories dùng TypeORM với PostgreSQL.

Trạng thái hiện tại:

- Bước 1 đến 3 đã triển khai trong `src/main.ts`.
- Auth request handlers đã triển khai trong `src/modules/auth/auth.controller.ts`.
- Các business request handler khác Đang chờ bổ sung.

## Trách nhiệm từng layer

- `src/main.ts`: bootstrap và global app behavior.
- `src/app.module.ts`: module composition.
- `src/configs`: env validation và database configuration.
- `src/database`: entity mapping và relation metadata.
- `src/modules/auth`: Google auth endpoints, token/session service logic, guard, request/response DTO, mapper và Google token verification.
- `src/modules/repositories`: data access layer; query conditions, order, relations và `QueryBuilder` cho auth/session nên nằm ở đây thay vì nhúng vào service.
- `src/common/enums`: domain constants dùng chung.
- `src/common/types`: shared type dùng chung như `CurrentUser`, `JwtPayload`, `RefreshTokenPayload`, `RequestWithUser`, `AuthTokenPair` và `RequestMetadata`.
- `src/common/interfaces`: shared interface dùng chung như `GoogleTokenInfo` và `GoogleUserProfile`.
- `src/common/messages`: shared auth message constants.

## Hướng phụ thuộc

- `main.ts` phụ thuộc `AppModule`.
- `AppModule` phụ thuộc `configs`, `RepositoriesModule`, `AuthModule`, `UsersModule` và `SessionsModule`.
- `AuthModule` phụ thuộc `RepositoriesModule`, `JwtModule` và global config.
- `RepositoriesModule` phụ thuộc `src/database`.
- Entities phụ thuộc `src/common/enums` và các entity liên quan.

## Dịch vụ bên ngoài

- PostgreSQL: được cấu hình và dùng qua TypeORM.
- Google OAuth tokeninfo endpoint: dùng khi verify Google ID token trong login.
- Redis: env vars và Docker service đã có, nhưng application integration Chưa triển khai.
- Swagger UI: được bật trong Nest app.

## Quyết định kiến trúc quan trọng

- Environment được load từ `.env.${NODE_ENV || 'development'}.local`.
- Env validation dùng Joi khi startup.
- TypeORM dùng `autoLoadEntities: true`.
- TypeORM dùng `synchronize: true`.
- Data access hiện được thể hiện qua custom repository classes.
- Auth module tách DTO theo `dto/request` và `dto/response`.
- Auth message trả client được gom trong `src/common/messages`.
- Shared auth type/interface được gom trong `src/common/types/auth.type.ts` và `src/common/interfaces/auth.interface.ts`.
- Auth service gọi repository methods có ý nghĩa nghiệp vụ thay vì nhúng trực tiếp `findOne/find/queryBuilder` cho session/user lookup.

## Giả định

- Kiến trúc mong muốn có vẻ là NestJS module-based, bắt đầu từ entities và repositories. Một số feature module/service/controller ngoài auth vẫn Đang chờ bổ sung.
