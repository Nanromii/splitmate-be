import { Entity, Index, BaseEntity, Column, ManyToOne, JoinColumn } from "typeorm";
import { Expense } from "./expense.entity";
import { User } from "./user.entity";

@Entity('expense_splits')
@Index(
  'uq_expense_splits_expense_user',
  ['expenseId', 'userId'],
  {
    unique: true,
  },
)
export class ExpenseSplit extends BaseEntity {
  @Index('idx_expense_splits_expense_id')
  @Column({
    name: 'expense_id',
  })
  expenseId: string;

  @Index('idx_expense_splits_user_id')
  @Column({
    name: 'user_id',
  })
  userId: string;

  @Column({
    type: 'numeric',
    precision: 15,
    scale: 2,
  })
  amount: string;

  @ManyToOne(() => Expense, (expense) => expense.splits, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'expense_id',
  })
  expense: Expense;

  @ManyToOne(() => User, (user) => user.expenseSplits, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
  })
  user: User;
}