import {
  Entity,
  Index,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Currency, ExpenseSplitType } from '../common/enums';
import { BaseEntity } from './base.entity';
import { Group } from './group.entity';
import { User } from './user.entity';
import { ExpenseSplit } from './expense-split.entity';

@Entity('expenses')
export class Expense extends BaseEntity {
  @Index('idx_expenses_group_id')
  @Column({
    name: 'group_id',
  })
  groupId: string;

  @Index('idx_expenses_paid_by')
  @Column({
    name: 'paid_by',
    nullable: true,
  })
  paidById?: string;

  @Column({
    length: 255,
  })
  title: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  note?: string;

  @Column({
    type: 'numeric',
    precision: 15,
    scale: 2,
  })
  amount: string;

  @Column({
    type: 'enum',
    enum: Currency,
    default: Currency.VND,
  })
  currency: Currency;

  @Column({
    name: 'split_type',
    type: 'enum',
    enum: ExpenseSplitType,
    default: ExpenseSplitType.EQUAL,
  })
  splitType: ExpenseSplitType;

  @Index('idx_expenses_expense_date')
  @Column({
    name: 'expense_date',
    type: 'timestamptz',
  })
  expenseDate: Date;

  @ManyToOne(() => Group, (group) => group.expenses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'group_id',
  })
  group: Group;

  @ManyToOne(() => User, (user) => user.paidExpenses, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'paid_by',
  })
  paidBy?: User;

  @OneToMany(() => ExpenseSplit, (split) => split.expense)
  splits: ExpenseSplit[];
}
