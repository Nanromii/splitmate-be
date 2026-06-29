import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { BaseEntity } from './base.entity';
import { GroupMember } from './group-member.entity';
import { Expense } from './expense.entity';
import { Settlement } from './settlement.entity';

@Entity('groups')
export class Group extends BaseEntity {
  @Column({
    length: 255,
  })
  name: string;

  @Column({
    nullable: true,
    type: 'text',
  })
  description?: string;

  @Column({
    name: 'avatar_url',
    nullable: true,
    type: 'text',
  })
  avatarUrl?: string;

  @Index('idx_groups_owner_id')
  @Column({
    name: 'owner_id',
    nullable: true,
  })
  ownerId?: string;

  @ManyToOne(() => User, (user) => user.ownedGroups, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'owner_id',
  })
  owner?: User;

  @OneToMany(() => GroupMember, (member) => member.group)
  members: GroupMember[];

  @OneToMany(() => Expense, (expense) => expense.group)
  expenses: Expense[];

  @OneToMany(() => Settlement, (settlement) => settlement.group)
  settlements: Settlement[];
}
