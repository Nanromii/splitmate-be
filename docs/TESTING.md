# Kiểm thử

## Công cụ test

- Jest
- `@nestjs/testing`
- `ts-jest`
- Supertest

## Lệnh unit test

- `pnpm test`
- `pnpm test:watch`
- `pnpm test:cov`
- `pnpm test:debug`

## Lệnh e2e test

- `pnpm test:e2e`

## Quy ước tên test file

- Unit tests: `*.spec.ts`
- E2E tests: `*.e2e-spec.ts`

## Chiến lược mock

- Unit test hiện dùng Nest `TestingModule`.
- `src/app.controller.spec.ts` dùng real `AppService`.
- Auth tests mock repository methods, JWT signing/verification, `ConfigService`, Google token verification và ESM-only `uuid` dependency.

## Nên test gì

- Bootstrap và configuration behavior
- Entity mapping và repository behavior
- Controller, service, auth và validation flows khi các phần tương ứng được triển khai
- Hành vi của env validation cho từng runtime mode

## Trạng thái hiện tại

- `pnpm build`: pass.
- `pnpm test`: pass.
- `pnpm test:e2e`: pass với auth routing spec tập trung.

## Auth coverage hiện tại

- Google login tạo user, session và token pair.
- Refresh token thành công sẽ rotate stored refresh token hash.
- Dùng lại refresh token cũ sẽ revoke session.
- Logout revoke session hiện tại.
- Logout all revoke active sessions của user hiện tại.
- Revoke session chặn session không thuộc user hiện tại.
- Invalid access token bị từ chối.
- E2E verify routing `POST /api/v1/auth/refresh` và bearer-token enforcement của `GET /api/v1/auth/me`.

## Giả định

- Test hiện đã được cập nhật khỏi hành vi của starter template cho các phần auth liên quan. Các domain module ngoài auth vẫn cần bổ sung test khi được triển khai.
