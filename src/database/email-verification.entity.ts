import {
  BaseEntity,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { User } from './user.entity';

@Entity({
  name: 'email_verifications',
})
@Index('idx_email_verifications_user_id', ['userId'])
@Index('idx_email_verifications_expires_at', ['expiresAt'])
export class EmailVerification extends BaseEntity {
  @Column({
    name: 'user_id',
    type: 'uuid',
    nullable: false,
  })
  userId: string;

  @ManyToOne(() => User, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'fk_email_verifications_user_id',
  })
  user: User;

  @Column({
    name: 'token_hash',
    type: 'varchar',
    length: 255,
    nullable: false,
    select: false,
    comment: 'Hashed verification token',
  })
  tokenHash: string;

  @Column({
    name: 'expires_at',
    type: 'timestamptz',
    nullable: false,
  })
  expiresAt: Date;

  @Column({
    name: 'verified_at',
    type: 'timestamptz',
    nullable: true,
  })
  verifiedAt?: Date | null;
}