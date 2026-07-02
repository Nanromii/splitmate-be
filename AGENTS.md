# AGENTS.md

## Bối cảnh dự án

- Repository này là NestJS backend cho domain SplitMate.
- Source hiện vẫn ở giai đoạn scaffold sớm.
- Phần đã triển khai gồm bootstrap, config, enums, entities, custom repositories, auth chỉ hỗ trợ Google login với JWT/session management, group management gồm membership/pagination/transfer owner và expense management với equal split.
- Các business module như settlements, interceptors và middleware vẫn Chưa triển khai.
- `UsersModule` và `SessionsModule` hiện chủ yếu là scaffold; workflow user/session đang được xử lý trong `AuthModule`.
- `src/common/messages` là nơi gom shared message constants trả về client.
- `src/common/interfaces` và `src/common/types` là nơi gom shared interface/type theo domain.
- `src/redis` hiện đang trống.

## Quy tắc cho AI coding agents

- Đọc `src`, `test`, env files và `package.json` trước khi suy luận.
- Xem `src` là nguồn sự thật. Không document hoặc implement feature chỉ dựa trên `dist/`.
- Không khẳng định endpoint, auth flow, validation rule hoặc repository tồn tại nếu không có trong `src`.
- Nếu một feature chưa có trong code, ghi là `Chưa triển khai` hoặc `Đang chờ bổ sung`.
- Giữ docs và code khớp với implementation hiện tại, kể cả khi implementation còn thiếu.
- Giữ auth chỉ hỗ trợ Google login trừ khi user yêu cầu rõ ràng phương thức khác.
- Không thêm username/password login, password reset hoặc email verification endpoints nếu chưa được yêu cầu.
- Không hardcode message trả về client trong service/controller/guard/repository. Message auth/group/expense phải lấy từ `src/common/messages/ERROR.ts` hoặc `INFO.ts`.
- Preserve entity table names, enum values và relation settings trừ khi user yêu cầu đổi.
- Nêu rõ inconsistency thật trong codebase thay vì âm thầm chuẩn hóa.
- Với query có `where`, `order`, `relations`, `select` hoặc `QueryBuilder`, ưu tiên đặt trong repository method có tên thể hiện ý nghĩa nghiệp vụ thay vì để trong service.

## Coding conventions

- Dùng TypeScript và NestJS patterns đã có trong repo.
- Tuân theo `.prettierrc`: single quotes và trailing commas.
- Tuân theo `eslint.config.mjs`.
- Giữ import explicit và cấu trúc local path đơn giản.
- Ưu tiên cập nhật `src/configs`, `src/database`, `src/modules/repositories` và module hiện có thay vì tạo abstraction song song.
- API bootstrap hiện dùng global prefix `api/v1`, global `ValidationPipe`, CORS và Swagger setup trong `src/main.ts`.
- Không over-engineer bằng base repository, abstract factory hoặc layer mới nếu source hiện tại chưa cần.

## Folder/module conventions

- `src/configs`: application và environment configuration.
- `src/common/enums`: enum dùng chung cho entities.
- `src/common/types`: shared type dùng chung, gom theo domain như `auth.type.ts`.
- `src/common/interfaces`: shared interface dùng chung, gom theo domain như `auth.interface.ts`.
- `src/common/messages`: shared message constants trả về client, hiện đang gom auth/group/expense messages tại đây.
- `src/database`: entity definitions và local shared base entity.
- `src/modules/repositories`: custom repository classes và repository module.
- `src/modules/auth`: Google login, JWT tokens, session management, auth guard, request/response DTO, mapper và Google token verification.
- `src/modules/auth/dto/request`: DTO nhận input từ client.
- `src/modules/auth/dto/response`: DTO trả response cho client.
- `src/modules/groups`: group management endpoints, DTO, service, mapper và membership/owner authorization ở service.
- `src/modules/groups/dto/request`: DTO nhận input cho group management.
- `src/modules/groups/dto/response`: DTO trả response cho group management.
- `src/modules/expenses`: expense equal split endpoints, DTO, service, mapper và membership validation ở service.
- `src/modules/expenses/dto/request`: DTO nhận input cho expense management.
- `src/modules/expenses/dto/response`: DTO trả response cho expense management.
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
