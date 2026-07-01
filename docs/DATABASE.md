# Database

## Công nghệ database

- PostgreSQL
- TypeORM
- Connection config nằm trong `src/configs/database.config.ts`
- `autoLoadEntities: true`
- `synchronize: true`
- Auth/session data access hiện đi qua custom repository methods trong `src/modules/repositories`, thay vì để service tự nhúng query conditions và `QueryBuilder`.

## Entities/tables chính

- `users`
- `groups`
- `group_members`
- `expenses`
- `expense_splits`
- `settlements`
- `files`
- `device_tokens`
- `notifications`
- `audit_logs`
- `sessions`
- `email_verifications`

## Quan hệ

- `Group.owner -> User` với `onDelete: SET NULL`
- `Group.members -> GroupMember`
- `Group.expenses -> Expense`
- `Group.settlements -> Settlement`
- `GroupMember.group -> Group` với `onDelete: CASCADE`
- `GroupMember.user -> User` với `onDelete: CASCADE`
- `Expense.group -> Group` với `onDelete: CASCADE`
- `Expense.paidBy -> User` với `onDelete: SET NULL`
- `Expense.splits -> ExpenseSplit`
- `ExpenseSplit.expense -> Expense` với `onDelete: CASCADE`
- `ExpenseSplit.user -> User` với `onDelete: CASCADE`
- `Settlement.group -> Group` với `onDelete: CASCADE`
- `Settlement.fromUser -> User` với `onDelete: SET NULL`
- `Settlement.toUser -> User` với `onDelete: SET NULL`
- `DeviceToken.user -> User` với `onDelete: CASCADE`
- `Notification.user -> User` với `onDelete: CASCADE`
- `Session.user -> User` với `onDelete: CASCADE`
- `EmailVerification.user -> User` với `onDelete: CASCADE`

## Soft delete

Triển khai một phần.

- `src/database/base.entity.ts` định nghĩa `deleted_at`.
- `Group`, `User` và `Session` extend local `src/database/base.entity.ts`.
- Một số entity khác hiện import `BaseEntity` từ `typeorm`, nên soft delete chưa nhất quán trên toàn source.

## Audit columns

Triển khai một phần.

- `src/database/base.entity.ts` định nghĩa `id`, `created_at`, `updated_at`, `deleted_at`, `created_by`, `updated_by`, `deleted_by` và `version`.
- `AuditLog` tự định nghĩa `id` và `created_at`.
- Do mixed `BaseEntity` imports, shared audit columns chưa áp dụng nhất quán cho mọi entity.

## Hành vi cascade

- Xóa `Group`: các row `GroupMember`, `Expense` và `Settlement` liên quan cascade.
- Xóa `Expense`: các row `ExpenseSplit` liên quan cascade.
- Xóa `User`: các row `GroupMember`, `ExpenseSplit`, `DeviceToken`, `Notification`, `Session` và `EmailVerification` liên quan cascade; `Group.owner`, `Expense.paidBy`, `Settlement.fromUser` và `Settlement.toUser` được set `NULL`.

## Index/unique constraints

- `users.email`: unique index `uq_users_email`
- `users(provider, provider_account_id)`: unique index `uq_users_provider_account`
- `group_members(group_id, user_id)`: unique index `uq_group_members_group_user`
- `expense_splits(expense_id, user_id)`: unique index `uq_expense_splits_expense_user`
- `device_tokens(user_id, token)`: unique index `uq_device_tokens_user_token`
- `audit_logs(entity_type, entity_id)`: composite index `idx_audit_logs_entity`
- `sessions.user_id`: index `idx_sessions_user_id`
- `sessions.status`: index `idx_sessions_status`
- `sessions.expires_at`: index `idx_sessions_expires_at`
- `sessions.last_activity_at`: index `idx_sessions_last_activity_at`
- Một số index đơn khác nằm trên các column kiểu foreign key như `group_id`, `user_id`, `owner_id`, `paid_by`, `from_user_id`, `to_user_id`, `entity_id` và `uploaded_by`.

## Columns cho auth/session

`sessions.refresh_token_hash` có `select: false` và chỉ lưu bcrypt hash. Raw refresh token không được lưu. `sessions.last_activity_at` được cập nhật sau refresh thành công và trả ra response dưới tên `lastUsedAt`.

`users.password_hash` nullable vì auth hiện chỉ hỗ trợ Google login. Google user được liên kết bằng `provider = google` và `provider_account_id`.

## Quy tắc migration

Chưa triển khai.

- Không tìm thấy migration files.
- Không tìm thấy seed files.
- `package.json` chưa có migration hoặc seed scripts.

## Giả định

- Source hiện có vẻ muốn dùng local shared base entity, nhưng mixed imports cần được verify trước khi dựa vào primary key hoặc audit columns đồng nhất trên toàn bộ tables.
