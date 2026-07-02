jest.mock('uuid', () => ({
  v7: jest.fn(() => '01980000-0000-7000-8000-000000000030'),
}));

import { Test, TestingModule } from '@nestjs/testing';
import { Currency, ExpenseSplitType, UserRole } from '../../common/enums';
import { EXPENSE_ERROR_MESSAGES } from '../../common/messages';
import type { CurrentUser } from '../../common/types';
import {
  Expense,
  ExpenseSplit,
  Group,
  GroupMember,
  User,
} from '../../database';
import {
  ExpenseRepository,
  GroupMemberRepository,
  GroupRepository,
} from '../repositories';
import { ExpensesService } from './expenses.service';

type ExpenseRepositoryMock = {
  createExpenseWithSplits: jest.MockedFunction<
    ExpenseRepository['createExpenseWithSplits']
  >;
  deleteExpense: jest.MockedFunction<ExpenseRepository['deleteExpense']>;
  findExpenseByIdAndGroupId: jest.MockedFunction<
    ExpenseRepository['findExpenseByIdAndGroupId']
  >;
  findExpenseDetailByIdAndGroupId: jest.MockedFunction<
    ExpenseRepository['findExpenseDetailByIdAndGroupId']
  >;
  findExpensesByGroupId: jest.MockedFunction<
    ExpenseRepository['findExpensesByGroupId']
  >;
  softDeleteExpenseWithSplits: jest.MockedFunction<
    ExpenseRepository['softDeleteExpenseWithSplits']
  >;
  updateExpenseWithOptionalSplits: jest.MockedFunction<
    ExpenseRepository['updateExpenseWithOptionalSplits']
  >;
};

type GroupRepositoryMock = {
  findGroupById: jest.MockedFunction<GroupRepository['findGroupById']>;
  findGroupByIdForActiveMember: jest.MockedFunction<
    GroupRepository['findGroupByIdForActiveMember']
  >;
};

type GroupMemberRepositoryMock = {
  findActiveMembersByGroupIdAndUserIds: jest.MockedFunction<
    GroupMemberRepository['findActiveMembersByGroupIdAndUserIds']
  >;
};

describe('ExpensesService', () => {
  let service: ExpensesService;
  let expenseRepository: ExpenseRepositoryMock;
  let groupRepository: GroupRepositoryMock;
  let groupMemberRepository: GroupMemberRepositoryMock;

  const now = new Date('2026-07-02T12:00:00.000Z');
  const groupId = '01980000-0000-7000-8000-000000000010';
  const expenseId = '01980000-0000-7000-8000-000000000020';
  const payerId = '01980000-0000-7000-8000-000000000001';
  const participantAId = payerId;
  const participantBId = '01980000-0000-7000-8000-000000000002';
  const participantCId = '01980000-0000-7000-8000-000000000003';
  const currentUser: CurrentUser = {
    id: payerId,
    email: 'payer@example.com',
    role: UserRole.USER,
    sessionId: '01980000-0000-7000-8000-000000000099',
  };

  const makeUser = (id: string): User =>
    ({
      id,
      email: `${id}@example.com`,
      displayName: `User ${id.slice(-1)}`,
      avatarUrl: null,
    }) as User;

  const makeGroup = (): Group =>
    ({
      id: groupId,
      currency: Currency.VND,
      createdAt: now,
      updatedAt: now,
    }) as Group;

  const makeMember = (userId: string): GroupMember =>
    ({
      id: `member-${userId}`,
      groupId,
      userId,
      user: makeUser(userId),
    }) as GroupMember;

  const makeSplit = (userId: string, amount: number): ExpenseSplit =>
    ({
      id: `split-${userId}`,
      expenseId,
      userId,
      amount: amount.toString(),
      user: makeUser(userId),
    }) as ExpenseSplit;

  const makeExpense = (amount = 300000): Expense =>
    ({
      id: expenseId,
      groupId,
      title: 'Dinner',
      note: 'Ăn tối ở Đà Nẵng',
      amount: amount.toString(),
      currency: Currency.VND,
      splitType: ExpenseSplitType.EQUAL,
      paidById: payerId,
      paidBy: makeUser(payerId),
      splits: [
        makeSplit(participantAId, 100000),
        makeSplit(participantBId, 100000),
        makeSplit(participantCId, 100000),
      ],
      expenseDate: now,
      createdAt: now,
      updatedAt: now,
    }) as Expense;

  const mockActiveMembers = (userIds: string[]) => {
    groupMemberRepository.findActiveMembersByGroupIdAndUserIds.mockResolvedValue(
      userIds.map((userId) => makeMember(userId)),
    );
  };

  beforeEach(async () => {
    expenseRepository = {
      createExpenseWithSplits: jest.fn(),
      deleteExpense: jest.fn(),
      findExpenseByIdAndGroupId: jest.fn(),
      findExpenseDetailByIdAndGroupId: jest.fn(),
      findExpensesByGroupId: jest.fn(),
      softDeleteExpenseWithSplits: jest.fn(),
      updateExpenseWithOptionalSplits: jest.fn(),
    };
    groupRepository = {
      findGroupById: jest.fn(),
      findGroupByIdForActiveMember: jest.fn(),
    };
    groupMemberRepository = {
      findActiveMembersByGroupIdAndUserIds: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpensesService,
        {
          provide: ExpenseRepository,
          useValue: expenseRepository,
        },
        {
          provide: GroupRepository,
          useValue: groupRepository,
        },
        {
          provide: GroupMemberRepository,
          useValue: groupMemberRepository,
        },
      ],
    }).compile();

    service = module.get<ExpensesService>(ExpensesService);
    groupRepository.findGroupById.mockResolvedValue(makeGroup());
    groupRepository.findGroupByIdForActiveMember.mockResolvedValue(makeGroup());
  });

  it('should create an equal split expense', async () => {
    mockActiveMembers([participantAId, participantBId, participantCId]);
    expenseRepository.createExpenseWithSplits.mockResolvedValue(makeExpense());

    const result = await service.createExpense(
      groupId,
      {
        title: ' Dinner ',
        description: ' Ăn tối ở Đà Nẵng ',
        amount: 300000,
        paidByUserId: payerId,
        participantIds: [participantAId, participantBId, participantCId],
        expenseDate: now.toISOString(),
      },
      currentUser,
    );

    expect(expenseRepository.createExpenseWithSplits).toHaveBeenCalledWith(
      expect.objectContaining({
        groupId,
        title: 'Dinner',
        note: 'Ăn tối ở Đà Nẵng',
        amount: 300000,
        currency: Currency.VND,
        paidById: payerId,
        splits: [
          { userId: participantAId, amount: 100000 },
          { userId: participantBId, amount: 100000 },
          { userId: participantCId, amount: 100000 },
        ],
      }),
    );
    expect(result.splits).toHaveLength(3);
  });

  it('should keep split total equal to expense amount when rounding', async () => {
    mockActiveMembers([participantAId, participantBId, participantCId]);
    expenseRepository.createExpenseWithSplits.mockResolvedValue(
      makeExpense(100),
    );

    await service.createExpense(
      groupId,
      {
        title: 'Snack',
        amount: 100,
        paidByUserId: payerId,
        participantIds: [participantAId, participantBId, participantCId],
      },
      currentUser,
    );

    const input = expenseRepository.createExpenseWithSplits.mock.calls[0][0];

    expect(input).toBeDefined();

    expect(input?.splits).toEqual([
      { userId: participantAId, amount: 34 },
      { userId: participantBId, amount: 33 },
      { userId: participantCId, amount: 33 },
    ]);
    expect(
      input?.splits.reduce((total: number, split: { amount: number }) => {
        return total + split.amount;
      }, 0),
    ).toBe(100);
  });

  it('should block current user who is not an active group member', async () => {
    groupRepository.findGroupByIdForActiveMember.mockResolvedValue(null);

    await expect(
      service.createExpense(
        groupId,
        {
          title: 'Dinner',
          amount: 300000,
          paidByUserId: payerId,
          participantIds: [participantAId],
        },
        currentUser,
      ),
    ).rejects.toThrow(EXPENSE_ERROR_MESSAGES.EXPENSE_FORBIDDEN);
  });

  it('should block payer that is not an active group member', async () => {
    mockActiveMembers([participantBId]);

    await expect(
      service.createExpense(
        groupId,
        {
          title: 'Dinner',
          amount: 300000,
          paidByUserId: payerId,
          participantIds: [participantBId],
        },
        currentUser,
      ),
    ).rejects.toThrow(EXPENSE_ERROR_MESSAGES.EXPENSE_PAYER_NOT_GROUP_MEMBER);
  });

  it('should block participant that is not an active group member', async () => {
    mockActiveMembers([payerId]);

    await expect(
      service.createExpense(
        groupId,
        {
          title: 'Dinner',
          amount: 300000,
          paidByUserId: payerId,
          participantIds: [participantAId, participantBId],
        },
        currentUser,
      ),
    ).rejects.toThrow(
      EXPENSE_ERROR_MESSAGES.EXPENSE_PARTICIPANT_NOT_GROUP_MEMBER,
    );
  });

  it('should block duplicated participants', async () => {
    await expect(
      service.createExpense(
        groupId,
        {
          title: 'Dinner',
          amount: 300000,
          paidByUserId: payerId,
          participantIds: [participantAId, participantAId],
        },
        currentUser,
      ),
    ).rejects.toThrow(EXPENSE_ERROR_MESSAGES.EXPENSE_PARTICIPANTS_DUPLICATED);
  });

  it('should block invalid amount', async () => {
    await expect(
      service.createExpense(
        groupId,
        {
          title: 'Dinner',
          amount: 0,
          paidByUserId: payerId,
          participantIds: [participantAId],
        },
        currentUser,
      ),
    ).rejects.toThrow(EXPENSE_ERROR_MESSAGES.EXPENSE_AMOUNT_INVALID);
  });

  it('should list expenses in a group', async () => {
    expenseRepository.findExpensesByGroupId.mockResolvedValue([makeExpense()]);

    const result = await service.listExpenses(groupId, currentUser);

    expect(expenseRepository.findExpensesByGroupId).toHaveBeenCalledWith(
      groupId,
    );
    expect(result[0].participantCount).toBe(3);
  });

  it('should return expense detail with splits', async () => {
    expenseRepository.findExpenseDetailByIdAndGroupId.mockResolvedValue(
      makeExpense(),
    );

    const result = await service.getExpenseDetail(
      groupId,
      expenseId,
      currentUser,
    );

    expect(result.splits).toHaveLength(3);
  });

  it('should update amount and participants by recalculating splits', async () => {
    expenseRepository.findExpenseDetailByIdAndGroupId.mockResolvedValue(
      makeExpense(),
    );
    expenseRepository.updateExpenseWithOptionalSplits.mockResolvedValue(
      makeExpense(100),
    );
    mockActiveMembers([participantAId, participantBId, participantCId]);

    await service.updateExpense(
      groupId,
      expenseId,
      {
        amount: 100,
        participantIds: [participantAId, participantBId, participantCId],
      },
      currentUser,
    );

    expect(
      expenseRepository.updateExpenseWithOptionalSplits,
    ).toHaveBeenCalledWith(
      expenseId,
      groupId,
      expect.objectContaining({
        amount: 100,
        splits: [
          { userId: participantAId, amount: 34 },
          { userId: participantBId, amount: 33 },
          { userId: participantCId, amount: 33 },
        ],
      }),
    );
  });

  it('should update basic fields without replacing splits', async () => {
    expenseRepository.findExpenseDetailByIdAndGroupId.mockResolvedValue(
      makeExpense(),
    );
    expenseRepository.updateExpenseWithOptionalSplits.mockResolvedValue(
      makeExpense(),
    );

    await service.updateExpense(
      groupId,
      expenseId,
      {
        title: 'Dinner updated',
        description: 'Updated description',
      },
      currentUser,
    );

    expect(
      expenseRepository.updateExpenseWithOptionalSplits,
    ).toHaveBeenCalled();

    const updateInput =
      expenseRepository.updateExpenseWithOptionalSplits.mock.calls[0][2];

    expect(updateInput).toBeDefined();
    expect(updateInput?.splits).toBeUndefined();
  });

  it('should soft delete expense and splits', async () => {
    expenseRepository.findExpenseByIdAndGroupId.mockResolvedValue(
      makeExpense(),
    );
    expenseRepository.softDeleteExpenseWithSplits.mockResolvedValue(undefined);

    await service.deleteExpense(groupId, expenseId, currentUser);

    expect(expenseRepository.softDeleteExpenseWithSplits).toHaveBeenCalledWith(
      expenseId,
      currentUser.id,
    );
  });
});
