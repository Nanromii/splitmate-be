import {
  Entity,
  Index,
  BaseEntity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DevicePlatform } from '../common/enums';
import { User } from './user.entity';

@Entity('device_tokens')
@Index('uq_device_tokens_user_token', ['userId', 'token'], {
  unique: true,
})
export class DeviceToken extends BaseEntity {
  @Index('idx_device_tokens_user_id')
  @Column({
    name: 'user_id',
  })
  userId: string;

  @Column({
    type: 'text',
  })
  token: string;

  @Column({
    type: 'enum',
    enum: DevicePlatform,
  })
  platform: DevicePlatform;

  @ManyToOne(() => User, (user) => user.deviceTokens, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
  })
  user: User;
}
