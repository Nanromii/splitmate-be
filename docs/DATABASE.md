# Database

## Database technology

- PostgreSQL
- TypeORM
- Connection config is in `src/configs/database.config.ts`
- `autoLoadEntities: true`
- `synchronize: true`

## Main entities/tables

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

## Relationships

- `Group.owner -> User` with `onDelete: SET NULL`
- `Group.members -> GroupMember`
- `Group.expenses -> Expense`
- `Group.settlements -> Settlement`
- `GroupMember.group -> Group` with `onDelete: CASCADE`
- `GroupMember.user -> User` with `onDelete: CASCADE`
- `Expense.group -> Group` with `onDelete: CASCADE`
- `Expense.paidBy -> User` with `onDelete: SET NULL`
- `Expense.splits -> ExpenseSplit`
- `ExpenseSplit.expense -> Expense` with `onDelete: CASCADE`
- `ExpenseSplit.user -> User` with `onDelete: CASCADE`
- `Settlement.group -> Group` with `onDelete: CASCADE`
- `Settlement.fromUser -> User` with `onDelete: SET NULL`
- `Settlement.toUser -> User` with `onDelete: SET NULL`
- `DeviceToken.user -> User` with `onDelete: CASCADE`
- `Notification.user -> User` with `onDelete: CASCADE`

## Soft delete

Partially implemented.

- `src/database/base.entity.ts` defines `deleted_at`.
- `Group` clearly extends the local `src/database/base.entity.ts`.
- Several other entities currently import `BaseEntity` from `typeorm` instead of the local base entity, so soft delete is not consistently defined across the current source.

## Audit columns

Partially implemented.

- `src/database/base.entity.ts` defines `id`, `created_at`, `updated_at`, `deleted_at`, `created_by`, and `updated_by`.
- `AuditLog` defines its own `id` and `created_at`.
- Because of the mixed `BaseEntity` imports, shared audit columns are not consistently applied across all current entities.

## Cascade behavior

- Delete a `Group`: related `GroupMember`, `Expense`, and `Settlement` rows cascade.
- Delete an `Expense`: related `ExpenseSplit` rows cascade.
- Delete a `User`: related `GroupMember`, `ExpenseSplit`, `DeviceToken`, and `Notification` rows cascade; `Group.owner`, `Expense.paidBy`, `Settlement.fromUser`, and `Settlement.toUser` are set to `NULL`.

## Index/unique constraints

- `users.email`: unique index `uq_users_email`
- `group_members(group_id, user_id)`: unique index `uq_group_members_group_user`
- `expense_splits(expense_id, user_id)`: unique index `uq_expense_splits_expense_user`
- `device_tokens(user_id, token)`: unique index `uq_device_tokens_user_token`
- `audit_logs(entity_type, entity_id)`: composite index `idx_audit_logs_entity`
- Additional single-column indexes exist on foreign-key style columns such as `group_id`, `user_id`, `owner_id`, `paid_by`, `from_user_id`, `to_user_id`, `entity_id`, and `uploaded_by`

## Migration rules

Not implemented yet.

- No migration files were found.
- No seed files were found.
- No migration or seed scripts are defined in `package.json`.

## Assumptions

- The current entity source appears to intend a shared local base entity, but the mixed imports should be verified before relying on uniform primary keys or audit columns across all tables.
