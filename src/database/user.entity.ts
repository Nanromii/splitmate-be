import { Entity, BaseEntity, Index, Column, OneToMany } from "typeorm";
import { GroupMember } from "./group-member.entity";
import { Group } from "./group.entity";
import { ExpenseSplit } from "./expense-split.entity";
import { Expense } from "./expense.entity";
import { Settlement } from "./settlement.entity";

@Entity('users')
export class User extends BaseEntity {
  @Index('uq_users_email', { unique: true })
  @Column({
    length: 255,
  })
  email: string;

  @Column({
    name: 'password_hash',
    length: 255,
  })
  passwordHash: string;

  @Column({
    name: 'full_name',
    length: 255,
  })
  fullName: string;

  @Column({
    name: 'avatar_url',
    nullable: true,
    type: 'text',
  })
  avatarUrl?: string;

  @Column({
    name: 'is_verified',
    default: false,
  })
  isVerified: boolean;

  // Relations

  @OneToMany(() => Group, (group) => group.owner)
  ownedGroups: Group[];

  @OneToMany(() => GroupMember, (member) => member.user)
  memberships: GroupMember[];

  @OneToMany(() => Expense, (expense) => expense.paidBy)
  paidExpenses: Expense[];

  @OneToMany(() => ExpenseSplit, (split) => split.user)
  expenseSplits: ExpenseSplit[];

  @OneToMany(() => Settlement, (settlement) => settlement.fromUser)
  outgoingSettlements: Settlement[];

  @OneToMany(() => Settlement, (settlement) => settlement.toUser)
  incomingSettlements: Settlement[];

  @OneToMany(() => DeviceToken, (token) => token.user)
  deviceTokens: DeviceToken[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];
}