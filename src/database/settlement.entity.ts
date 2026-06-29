import {
  Entity,
  BaseEntity,
  Index,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SettlementStatus } from '../common/enums';
import { Group } from './group.entity';
import { User } from './user.entity';

@Entity('settlements')
export class Settlement extends BaseEntity {
  @Index('idx_settlements_group_id')
  @Column({
    name: 'group_id',
  })
  groupId: string;

  @Index('idx_settlements_from_user_id')
  @Column({
    name: 'from_user_id',
    nullable: true,
  })
  fromUserId?: string;

  @Index('idx_settlements_to_user_id')
  @Column({
    name: 'to_user_id',
    nullable: true,
  })
  toUserId?: string;

  @Column({
    type: 'numeric',
    precision: 15,
    scale: 2,
  })
  amount: string;

  @Column({
    type: 'enum',
    enum: SettlementStatus,
    default: SettlementStatus.PENDING,
  })
  status: SettlementStatus;

  @ManyToOne(() => Group, (group) => group.settlements, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'group_id',
  })
  group: Group;

  @ManyToOne(() => User, (user) => user.outgoingSettlements, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'from_user_id',
  })
  fromUser?: User;

  @ManyToOne(() => User, (user) => user.incomingSettlements, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'to_user_id',
  })
  toUser?: User;
}
