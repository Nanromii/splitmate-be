import { Column, Entity, Index, OneToMany } from 'typeorm';
import { AuthProvider, UserRole, UserStatus } from '../common/enums';
import { BaseEntity } from './base.entity';
import { DeviceToken } from './device-token.entity';
import { ExpenseSplit } from './expense-split.entity';
import { Expense } from './expense.entity';
import { GroupMember } from './group-member.entity';
import { Group } from './group.entity';
import { Notification } from './notification.entity';
import { Session } from './session.entity';
import { Settlement } from './settlement.entity';

@Entity({
  name: 'users',
})
@Index('idx_users_email', ['email'])
@Index('idx_users_username', ['username'])
@Index('idx_users_status', ['status'])
@Index('idx_users_provider', ['provider'])
@Index('uq_users_provider_account', ['provider', 'providerAccountId'], {
  unique: true,
})
export class User extends BaseEntity {
  @Column({
    name: 'email',
    type: 'varchar',
    length: 320,
    nullable: false,
    unique: true,
    comment: 'User email address',
  })
  email: string;

  @Column({
    name: 'username',
    type: 'varchar',
    length: 50,
    nullable: true,
    unique: true,
    comment: 'Public username',
  })
  username?: string | null;

  @Column({
    name: 'display_name',
    type: 'varchar',
    length: 100,
    nullable: false,
    comment: 'Display name',
  })
  displayName: string;

  @Column({
    name: 'avatar_url',
    type: 'varchar',
    length: 1024,
    nullable: true,
    comment: 'Avatar image url',
  })
  avatarUrl?: string | null;

  @Column({
    name: 'password_hash',
    type: 'varchar',
    length: 255,
    nullable: true,
    select: false,
    comment:
      'Password hash for non-Google providers. Not used by Google login.',
  })
  passwordHash?: string | null;

  @Column({
    name: 'provider',
    type: 'enum',
    enum: AuthProvider,
    default: AuthProvider.LOCAL,
    comment: 'Authentication provider',
  })
  provider: AuthProvider;

  @Column({
    name: 'provider_account_id',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'Provider-specific account id, such as Google sub',
  })
  providerAccountId?: string | null;

  @Column({
    name: 'email_verified_at',
    type: 'timestamptz',
    nullable: true,
    comment: 'Email verification timestamp',
  })
  emailVerifiedAt?: Date | null;

  @Column({
    name: 'token_version',
    type: 'smallint',
    default: 0,
    comment: 'JWT token version',
  })
  tokenVersion: number;

  @Column({
    name: 'role',
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
    comment: 'System role',
  })
  role: UserRole;

  @Column({
    name: 'status',
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING_VERIFICATION,
    comment: 'Current user status',
  })
  status: UserStatus;

  @Column({
    name: 'last_login_at',
    type: 'timestamptz',
    nullable: true,
    comment: 'Last successful login time',
  })
  lastLoginAt?: Date | null;

  @OneToMany(() => Session, (session) => session.user)
  sessions: Session[];

  @OneToMany(() => Group, (group) => group.owner)
  ownedGroups: Group[];

  @OneToMany(() => GroupMember, (membership) => membership.user)
  memberships: GroupMember[];

  @OneToMany(() => Expense, (expense) => expense.paidBy)
  paidExpenses: Expense[];

  @OneToMany(() => ExpenseSplit, (split) => split.user)
  expenseSplits: ExpenseSplit[];

  @OneToMany(() => Settlement, (settlement) => settlement.fromUser)
  outgoingSettlements: Settlement[];

  @OneToMany(() => Settlement, (settlement) => settlement.toUser)
  incomingSettlements: Settlement[];

  @OneToMany(() => DeviceToken, (deviceToken) => deviceToken.user)
  deviceTokens: DeviceToken[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];
}
