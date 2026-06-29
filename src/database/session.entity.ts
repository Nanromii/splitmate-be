import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { SessionStatus } from '../common/enums';
import { RevokeReason } from '../common/enums/revoke-reason.enum';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';

@Entity({
  name: 'sessions',
})
@Index('idx_sessions_user_id', ['userId'])
@Index('idx_sessions_status', ['status'])
@Index('idx_sessions_expires_at', ['expiresAt'])
@Index('idx_sessions_last_activity_at', ['lastActivityAt'])
export class Session extends BaseEntity {
  @Column({
    name: 'user_id',
    type: 'uuid',
    nullable: false,
    comment: 'Owner user id',
  })
  userId: string;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'fk_sessions_user_id',
  })
  user: User;

  @Column({
    name: 'refresh_token_hash',
    type: 'varchar',
    length: 255,
    nullable: false,
    select: false,
    comment: 'Hashed refresh token',
  })
  refreshTokenHash: string;

  @Column({
    name: 'token_family',
    type: 'uuid',
    nullable: false,
    comment: 'Refresh token family id',
  })
  tokenFamily: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: SessionStatus,
    default: SessionStatus.ACTIVE,
    comment: 'Current session status',
  })
  status: SessionStatus;

  @Column({
    name: 'device_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  deviceId?: string | null;

  @Column({
    name: 'device_name',
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  deviceName?: string | null;

  @Column({
    name: 'platform',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  platform?: string | null;

  @Column({
    name: 'browser',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  browser?: string | null;

  @Column({
    name: 'browser_version',
    type: 'varchar',
    length: 30,
    nullable: true,
  })
  browserVersion?: string | null;

  @Column({
    name: 'os',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  os?: string | null;

  @Column({
    name: 'os_version',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  osVersion?: string | null;

  @Column({
    name: 'ip_address',
    type: 'varchar',
    length: 45,
    nullable: true,
  })
  ipAddress?: string | null;

  @Column({
    name: 'country',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  country?: string | null;

  @Column({
    name: 'city',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  city?: string | null;

  @Column({
    name: 'timezone',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  timezone?: string | null;

  @Column({
    name: 'user_agent',
    type: 'text',
    nullable: true,
  })
  userAgent?: string | null;

  @Column({
    name: 'last_activity_at',
    type: 'timestamptz',
    nullable: false,
  })
  lastActivityAt: Date;

  @Column({
    name: 'expires_at',
    type: 'timestamptz',
    nullable: false,
  })
  expiresAt: Date;

  @Column({
    name: 'revoked_at',
    type: 'timestamptz',
    nullable: true,
  })
  revokedAt?: Date | null;

  @Column({
    name: 'revoke_reason',
    type: 'enum',
    enum: RevokeReason,
    nullable: true,
  })
  revokeReason?: RevokeReason | null;
}
