import { Expense, ExpenseSplit, User } from '../../database';
import {
  ExpenseDetailResponseDto,
  ExpenseResponseDto,
  ExpenseSplitResponseDto,
  ExpenseUserResponseDto,
} from './dto/response';

export const mapUserToExpenseUserResponse = (
  user: User,
): ExpenseUserResponseDto => ({
  id: user.id,
  name: user.displayName,
  email: user.email,
  avatarUrl: user.avatarUrl ?? null,
});

export const mapExpenseSplitToResponse = (
  split: ExpenseSplit,
): ExpenseSplitResponseDto => ({
  splitId: split.id,
  userId: split.userId,
  user: mapUserToExpenseUserResponse(split.user),
  amount: Number(split.amount),
});

export const mapExpenseToResponse = (expense: Expense): ExpenseResponseDto => ({
  id: expense.id,
  groupId: expense.groupId,
  title: expense.title,
  description: expense.note ?? null,
  amount: Number(expense.amount),
  currency: expense.currency,
  splitType: expense.splitType,
  paidByUserId: expense.paidById ?? '',
  paidByUser: expense.paidBy
    ? mapUserToExpenseUserResponse(expense.paidBy)
    : null,
  participantCount: expense.splits?.length ?? 0,
  expenseDate: expense.expenseDate,
  createdAt: expense.createdAt,
  updatedAt: expense.updatedAt,
});

export const mapExpenseToDetailResponse = (
  expense: Expense,
): ExpenseDetailResponseDto => ({
  ...mapExpenseToResponse(expense),
  splits:
    expense.splits?.map((split) => mapExpenseSplitToResponse(split)) ?? [],
});
