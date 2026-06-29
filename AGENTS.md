# AGENTS.md

## Bối cảnh dự án

- Repository này là NestJS backend cho domain SplitMate.
- Source hiện vẫn ở giai đoạn scaffold sớm.
- Phần đã triển khai gồm bootstrap, config, enums, entities, custom repositories và auth chỉ hỗ trợ Google login với JWT/session management.
- Các business module như groups, expenses, settlements, interceptors, middleware và message catalogs dùng chung vẫn Chưa triển khai.
- `UsersModule` và `SessionsModule` hiện chủ yếu là scaffold; workflow user/session đang được xử lý trong `AuthModule`.
- `src/common/messages` và `src/redis` hiện đang trống.

## Quy tắc cho AI coding agents

- Đọc `src`, `test`, env files và `package.json` trước khi suy luận.
- Xem `src` là nguồn sự thật. Không document hoặc implement feature chỉ dựa trên `dist/`.
- Không khẳng định endpoint, auth flow, validation rule hoặc repository tồn tại nếu không có trong `src`.
- Nếu một feature chưa có trong code, ghi là `Chưa triển khai` hoặc `Đang chờ bổ sung`.
- Giữ docs và code khớp với implementation hiện tại, kể cả khi implementation còn thiếu.
- Giữ auth chỉ hỗ trợ Google login trừ khi user yêu cầu rõ ràng phương thức khác.
- Không thêm username/password login, password reset hoặc email verification endpoints nếu chưa được yêu cầu.
- Không hardcode message trả về client trong service/controller/guard. Message auth phải lấy từ `src/modules/auth/messages/ERROR.ts` hoặc `INFO.ts`.
- Preserve entity table names, enum values và relation settings trừ khi user yêu cầu đổi.
- Nêu rõ inconsistency thật trong codebase thay vì âm thầm chuẩn hóa.

## Coding conventions

- Dùng TypeScript và NestJS patterns đã có trong repo.
- Tuân theo `.prettierrc`: single quotes và trailing commas.
- Tuân theo `eslint.config.mjs`.
- Giữ import explicit và cấu trúc local path đơn giản.
- Ưu tiên cập nhật `src/configs`, `src/database`, `src/modules/repositories` và module hiện có thay vì tạo abstraction song song.
- API bootstrap hiện dùng global prefix `api/v1`, global `ValidationPipe`, CORS và Swagger setup trong `src/main.ts`.

## Folder/module conventions

- `src/configs`: application và environment configuration.
- `src/common/enums`: enum dùng chung cho entities.
- `src/common/types`: type dùng chung như `CurrentUser`, `JwtPayload`, `RefreshTokenPayload`, `RequestWithUser`.
- `src/common/messages`: Đang chờ bổ sung cho shared messages.
- `src/database`: entity definitions và local shared base entity.
- `src/modules/repositories`: custom repository classes và repository module.
- `src/modules/auth`: Google login, JWT tokens, session management, auth guard, request/response DTO, auth types, messages và Google token verification.
- `src/modules/auth/dto/request`: DTO nhận input từ client.
- `src/modules/auth/dto/response`: DTO trả response cho client.
- `src/modules/auth/messages`: message tiếng Việt cho auth.
- `src/modules/auth/types`: type nội bộ của auth module.
- `src/redis`: Chưa triển khai.
- `test`: e2e tests và Jest e2e config.

## Commands cần chạy trước khi kết thúc

- Luôn chạy `pnpm build`.
- Chạy `pnpm test` nếu sửa source có unit test hoặc test files.
- Chạy `pnpm test:e2e` nếu sửa bootstrap, config, routing hoặc integration behavior.
- Chạy `pnpm lint` chỉ khi sẵn sàng nhận auto-fix, vì script dùng `--fix`.

## Những việc AI không được làm

- Không tự thêm auth guards, JWT strategies, DTOs, controllers, services hoặc middleware không có trong scope yêu cầu.
- Không giả định Redis đã được wire vào app chỉ vì có Redis env vars và Docker config.
- Không giả định migrations tồn tại. Codebase hiện dùng TypeORM `synchronize: true`.
- Không dùng `dist/` để suy luận source behavior bị thiếu, trừ khi ghi rõ đó là compiled output và đã kiểm tra mismatch với source.
- Không đổi business logic khi yêu cầu chỉ là tài liệu hoặc refactor không đổi behavior.

## Commit message convention

Đang chờ bổ sung. Source hiện chưa định nghĩa convention commit message.

## Giả định

- Team có vẻ muốn `src/database/base.entity.ts` là shared base entity, nhưng một số entity hiện vẫn import `BaseEntity` từ `typeorm`. Hãy xem đây là implementation detail cần verify trước khi refactor.
