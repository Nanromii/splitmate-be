import {
  BaseEntity,
  Column,
  Entity,
  Index,
} from 'typeorm';
import { AuthProvider, UserRole, UserStatus } from '../common/enums';

@Entity({
  name: 'users',
})
@Index('idx_users_email', ['email'])
@Index('idx_users_username', ['username'])
@Index('idx_users_status', ['status'])
@Index('idx_users_provider', ['provider'])
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
    nullable: false,
    select: false,
    comment: 'Argon2 hashed password',
  })
  passwordHash: string;

  @Column({
    name: 'provider',
    type: 'enum',
    enum: AuthProvider,
    default: AuthProvider.LOCAL,
    comment: 'Authentication provider',
  })
  provider: AuthProvider;

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
}