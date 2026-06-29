# Triển khai

## Lệnh build

- `pnpm build`

## Production env

- Script start production là `pnpm start:prod`.
- `src/app.module.ts` load `.env.production.local` khi `NODE_ENV=production`.
- Các env vars bắt buộc được validate bằng Joi khi startup.

Ghi chú quan trọng:

- Validation schema hiện yêu cầu split JWT secrets: `JWT_ACCESS_SECRET` và `JWT_REFRESH_SECRET`.
- `GOOGLE_CLIENT_ID` phải được cấu hình cho frontend Google client dùng ở production.

## Ghi chú Docker/deployment

- Repo có `docker-compose.yml` cho PostgreSQL và Redis.
- Không tìm thấy Dockerfile cho app.
- Không tìm thấy deployment manifests hoặc CI/CD deployment config trong source hiện tại.

## Migration trước deployment

Đang chờ bổ sung.

- `package.json` chưa có migration command.
- Không tìm thấy migration files.
- Code hiện dựa vào TypeORM `synchronize: true`.

## Health check

Chưa triển khai.

- Không tìm thấy health controller hoặc health endpoint riêng.

## Checklist release

- Chạy `pnpm build`.
- Chạy `pnpm test`.
- Chạy `pnpm test:e2e`.
- Kiểm tra production env variables khớp validation schema hiện tại.
- Kiểm tra `JWT_ACCESS_SECRET` và `JWT_REFRESH_SECRET` là hai secret mạnh khác nhau.
- Kiểm tra `GOOGLE_CLIENT_ID` khớp deployed frontend Google client.
- Kiểm tra PostgreSQL và Redis có thể truy cập từ target environment.
- Review ảnh hưởng của `synchronize: true` trước production startup.

## Giả định

- Deployment target Đang chờ bổ sung vì repo chưa có deployment configuration theo platform cụ thể.
