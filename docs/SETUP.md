# Thiết lập

## Điều kiện tiên quyết

- Cần Node.js. Phiên bản chính xác Đang chờ bổ sung vì `package.json` chưa có `engines`.
- Cần pnpm để chạy repository scripts.
- Cần PostgreSQL.
- Cần Redis vì env validation đang yêu cầu, dù Redis integration vẫn Chưa triển khai.

## Cài đặt

- Cài dependencies bằng pnpm trước khi chạy script của project.
- Repo chưa có bootstrap script riêng trong `package.json`.

## Thiết lập environment

- Tạo `.env.development.local` từ `env.example`.
- App load `.env.${NODE_ENV || 'development'}.local`.
- Validation schema hiện yêu cầu:
  - `NODE_ENV`
  - `PORT`
  - `DB_HOST`
  - `DB_PORT`
  - `DB_USERNAME`
  - `DB_PASSWORD`
  - `DB_DATABASE`
  - `REDIS_HOST`
  - `REDIS_PORT`
  - `JWT_ACCESS_SECRET`
  - `JWT_ACCESS_EXPIRES_IN`
  - `JWT_REFRESH_SECRET`
  - `JWT_REFRESH_EXPIRES_IN`
  - `GOOGLE_CLIENT_ID`

Ghi chú quan trọng:

- `JWT_ACCESS_SECRET` và `JWT_REFRESH_SECRET` nên là hai secret mạnh khác nhau ngoài local development.
- `GOOGLE_CLIENT_ID` phải khớp với client id mà frontend dùng để lấy Google ID token.

## Thiết lập database

- Database type là PostgreSQL.
- Config nằm trong `src/configs/database.config.ts`.
- App hiện dựa vào TypeORM `synchronize: true`.
- Source hiện chưa có migrations hoặc seeds.
- Auth/session schema hiện được áp dụng bằng TypeORM `synchronize: true`.

## Thiết lập Redis/Docker

- `docker-compose.yml` định nghĩa:
  - `postgres` dùng `postgres:16`
  - `redis` dùng `redis:7-alpine`
- Redis hiện chỉ được chuẩn bị ở tầng hạ tầng. Không tìm thấy Redis module/service implementation trong `src`.

## Lệnh migration/seed

Chưa triển khai.

## Chạy local

- Dùng `pnpm start:dev` cho local development.
- Dùng `pnpm start` để chạy Nest CLI không kèm wrapper `NODE_ENV=development`.

## Xử lý sự cố

- Nếu thiếu env variables, startup sẽ fail ở bước Joi validation.
- `pnpm test` hiện pass.
- `pnpm test:e2e` hiện pass với auth routing spec không cần PostgreSQL.
- Vì `synchronize: true` đang bật, schema changes có thể được áp dụng tự động khi app startup với database đã kết nối.

## Giả định

- `docker-compose.yml` có vẻ phục vụ local development vì repo chưa có Dockerfile hoặc application container definition.
