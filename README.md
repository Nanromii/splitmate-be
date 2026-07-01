# SplitMate Backend

## Tổng quan dự án

SplitMate là NestJS backend cho domain chia sẻ chi phí. Source hiện có bootstrap, environment/database configuration, domain entities, custom repositories và Google-only authentication với JWT access/refresh tokens và session management. Shared auth messages, shared auth type/interface và auth query convention hiện được gom về `src/common` và `src/modules/repositories`. Các business module như groups, expenses, settlements, interceptors và middleware vẫn Chưa triển khai.

## Công nghệ

- NestJS 11
- TypeScript 5
- TypeORM
- PostgreSQL
- Redis
- Swagger
- Joi cho env validation
- Jest + Supertest
- ESLint + Prettier

## Yêu cầu môi trường

- Cần Node.js. Phiên bản chính xác Đang chờ bổ sung vì `package.json` chưa có `engines`.
- Cần pnpm để chạy scripts của repo.
- Cần PostgreSQL và Redis vì env validation hiện yêu cầu cả hai.

## Khởi chạy nhanh

1. Cài dependencies bằng pnpm.
2. Tạo `.env.development.local` từ `env.example`.
3. Chạy PostgreSQL và Redis bằng `docker-compose.yml` của repo.
4. Chạy development server bằng `pnpm start:dev`.

## Biến môi trường

Được validate bởi `src/configs/env-validation.config.ts`:

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

- Auth dùng secret riêng cho access token và refresh token. `JWT_SECRET` không còn được validate trong source hiện tại.
- `GOOGLE_CLIENT_ID` phải khớp với Google client mà frontend dùng để lấy Google ID token.

## Scripts

- `pnpm build`: build NestJS app vào `dist/`.
- `pnpm format`: chạy Prettier cho `src/**/*.ts` và `test/**/*.ts`.
- `pnpm start`: chạy app bằng Nest CLI.
- `pnpm start:dev`: chạy app watch mode với `NODE_ENV=development`.
- `pnpm start:prod`: chạy compiled app với `NODE_ENV=production`.
- `pnpm start:debug`: chạy debug watch mode.
- `pnpm lint`: chạy ESLint với `--fix`.
- `pnpm test`: chạy unit tests.
- `pnpm test:watch`: chạy unit tests watch mode.
- `pnpm test:cov`: chạy test coverage.
- `pnpm test:debug`: chạy Jest debug.
- `pnpm test:e2e`: chạy end-to-end tests.

## Tài liệu Swagger/API

- Global API prefix: `/api/v1`
- Swagger UI path: `/api/docs`
- Swagger title: `SplitMate API`
- Swagger description: `SplitMate Backend API`
- Swagger bearer auth được đăng ký trong `src/main.ts`.

Trạng thái hiện tại:

- Swagger đã được cấu hình trong `src/main.ts`.
- Auth endpoints đã triển khai dưới `/api/v1/auth`.
- Các domain endpoint khác Đang chờ bổ sung.

## Cấu trúc dự án

```text
splitmate/
├─ src/
│  ├─ common/
│  │  ├─ decorators/
│  │  ├─ enums/
│  │  ├─ interfaces/
│  │  ├─ messages/
│  │  └─ types/
│  ├─ configs/
│  ├─ database/
│  ├─ modules/
│  │  ├─ auth/
│  │  ├─ repositories/
│  │  ├─ sessions/
│  │  └─ users/
│  ├─ redis/                  # trống
│  ├─ app.controller.ts
│  ├─ app.module.ts
│  ├─ app.service.ts
│  └─ main.ts
├─ test/
├─ docker/
├─ env.example
├─ docker-compose.yml
└─ docs/
```

## Ghi chú hữu ích

- Tài liệu chi tiết nằm trong `docs/`.
- `docker-compose.yml` định nghĩa PostgreSQL và Redis cho local development.
- Auth message trả client được gom trong `src/common/messages`.
- Shared auth type/interface được gom trong `src/common/types/auth.type.ts` và `src/common/interfaces/auth.interface.ts`.
- `pnpm build` hiện pass.
- `pnpm test` hiện pass.
- `pnpm test:e2e` hiện pass với auth routing spec tập trung.

## Giả định

- Repo có `pnpm-lock.yaml`, nên dependency installation nên dùng pnpm. `package.json` hiện chưa khai báo `packageManager`.
