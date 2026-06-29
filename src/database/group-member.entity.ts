import {
  Entity,
  Index,
  BaseEntity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { GroupRole } from '../common/enums';
import { Group } from './group.entity';
import { User } from './user.entity';

@Entity('group_members')
@Index('uq_group_members_group_user', ['groupId', 'userId'], {
  unique: true,
})
export class GroupMember extends BaseEntity {
  @Index('idx_group_members_group_id')
  @Column({
    name: 'group_id',
  })
  groupId: string;

  @Index('idx_group_members_user_id')
  @Column({
    name: 'user_id',
  })
  userId: string;

  @Column({
    type: 'enum',
    enum: GroupRole,
    default: GroupRole.MEMBER,
  })
  role: GroupRole;

  @ManyToOne(() => Group, (group) => group.members, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'group_id',
  })
  group: Group;

  @ManyToOne(() => User, (user) => user.memberships, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
  })
  user: User;
}
