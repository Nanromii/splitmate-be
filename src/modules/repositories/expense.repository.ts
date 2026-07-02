import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { ExpenseSplitType } from '../../common/enums';
import { Expense, ExpenseSplit } from '../../database';

export type ExpenseSplitInput = {
  userId: string;
  amount: number;
};

export type ExpenseCreateInput = {
  groupId: string;
  title: string;
  note?: string | null;
  amount: number;
  currency: Expense['currency'];
  paidById: string;
  expenseDate: Date;
  createdBy: string;
  splits: ExpenseSplitInput[];
};

export type ExpenseUpdateInput = {
  title?: string;
  note?: string | null;
  amount?: number;
  paidById?: string;
  expenseDate?: Date;
  updatedBy: string;
  splits?: ExpenseSplitInput[];
};

@Injectable()
export class ExpenseRepository extends Repository<Expense> {
  constructor(private readonly dataSource: DataSource) {
    super(Expense, dataSource.createEntityManager());
  }

  findExpenseById(expenseId: string): Promise<Expense | null> {
    return this.findOne({
      where: {
        id: expenseId,
      },
    });
  }

  findExpenseByIdAndGroupId(
    expenseId: string,
    groupId: string,
  ): Promise<Expense | null> {
    return this.findOne({
      where: {
        id: expenseId,
        groupId,
      },
    });
  }

  findExpenseDetailByIdAndGroupId(
    expenseId: string,
    groupId: string,
  ): Promise<Expense | null> {
    return this.findOne({
      where: {
        id: expenseId,
        groupId,
      },
      relations: {
        paidBy: true,
        splits: {
          user: true,
        },
      },
    });
  }

  findExpensesByGroupId(groupId: string): Promise<Expense[]> {
    return this.find({
      where: {
        groupId,
      },
      relations: {
        paidBy: true,
        splits: true,
      },
      order: {
        expenseDate: 'DESC',
        createdAt: 'DESC',
      },
    });
  }

  async createExpenseWithSplits(input: ExpenseCreateInput): Promise<Expense> {
    return this.dataSource.transaction(async (manager) => {
      const expense = await this.createExpenseWithManager(manager, input);

      await this.createExpenseSplitsWithManager(
        manager,
        expense.id,
        input.createdBy,
        input.splits,
      );

      return this.findExpenseDetailWithManager(
        manager,
        expense.id,
        input.groupId,
      );
    });
  }

  async updateExpenseWithOptionalSplits(
    expenseId: string,
    groupId: string,
    input: ExpenseUpdateInput,
  ): Promise<Expense> {
    return this.dataSource.transaction(async (manager) => {
      await manager.update(
        Expense,
        {
          id: expenseId,
          groupId,
        },
        {
          ...(input.title !== undefined ? { title: input.title } : {}),
          ...(input.note !== undefined
            ? { note: input.note ?? undefined }
            : {}),
          ...(input.amount !== undefined
            ? { amount: input.amount.toString() }
            : {}),
          ...(input.paidById !== undefined ? { paidById: input.paidById } : {}),
          ...(input.expenseDate !== undefined
            ? { expenseDate: input.expenseDate }
            : {}),
          updatedBy: input.updatedBy,
        },
      );

      if (input.splits) {
        await this.replaceExpenseSplitsWithManager(
          manager,
          expenseId,
          input.updatedBy,
          input.splits,
        );
      }

      return this.findExpenseDetailWithManager(manager, expenseId, groupId);
    });
  }

  async softDeleteExpenseWithSplits(
    expenseId: string,
    userId: string,
  ): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const deletedAt = new Date();

      await manager.update(
        Expense,
        {
          id: expenseId,
        },
        {
          deletedAt,
          deletedBy: userId,
        },
      );

      await manager.update(
        ExpenseSplit,
        {
          expenseId,
        },
        {
          deletedAt,
          deletedBy: userId,
        },
      );
    });
  }

  private async createExpenseWithManager(
    manager: EntityManager,
    input: ExpenseCreateInput,
  ): Promise<Expense> {
    const expenseRepository = manager.getRepository(Expense);
    const expense = expenseRepository.create({
      groupId: input.groupId,
      title: input.title,
      note: input.note ?? undefined,
      amount: input.amount.toString(),
      currency: input.currency,
      paidById: input.paidById,
      splitType: ExpenseSplitType.EQUAL,
      expenseDate: input.expenseDate,
      createdBy: input.createdBy,
    });

    return expenseRepository.save(expense);
  }

  private async createExpenseSplitsWithManager(
    manager: EntityManager,
    expenseId: string,
    actorId: string,
    splits: ExpenseSplitInput[],
  ): Promise<void> {
    const splitRepository = manager.getRepository(ExpenseSplit);
    const splitEntities = splits.map((split) =>
      splitRepository.create({
        expenseId,
        userId: split.userId,
        amount: split.amount.toString(),
        createdBy: actorId,
      }),
    );

    await splitRepository.save(splitEntities);
  }

  private async replaceExpenseSplitsWithManager(
    manager: EntityManager,
    expenseId: string,
    actorId: string,
    splits: ExpenseSplitInput[],
  ): Promise<void> {
    const splitRepository = manager.getRepository(ExpenseSplit);
    const existingSplits = await splitRepository.find({
      where: {
        expenseId,
      },
      withDeleted: true,
    });
    const nextSplitsByUserId = new Map(
      splits.map((split) => [split.userId, split]),
    );

    for (const existingSplit of existingSplits) {
      const nextSplit = nextSplitsByUserId.get(existingSplit.userId);

      if (!nextSplit) {
        existingSplit.deletedAt = new Date();
        existingSplit.deletedBy = actorId;
        existingSplit.updatedBy = actorId;
        await splitRepository.save(existingSplit);
        continue;
      }

      existingSplit.amount = nextSplit.amount.toString();
      existingSplit.deletedAt = null;
      existingSplit.deletedBy = null;
      existingSplit.updatedBy = actorId;
      await splitRepository.save(existingSplit);
      nextSplitsByUserId.delete(existingSplit.userId);
    }

    const newSplits = [...nextSplitsByUserId.values()].map((split) =>
      splitRepository.create({
        expenseId,
        userId: split.userId,
        amount: split.amount.toString(),
        createdBy: actorId,
      }),
    );

    if (newSplits.length > 0) {
      await splitRepository.save(newSplits);
    }
  }

  private async findExpenseDetailWithManager(
    manager: EntityManager,
    expenseId: string,
    groupId: string,
  ): Promise<Expense> {
    const expense = await manager.getRepository(Expense).findOne({
      where: {
        id: expenseId,
        groupId,
      },
      relations: {
        paidBy: true,
        splits: {
          user: true,
        },
      },
    });

    if (!expense) {
      throw new Error('Expense was not found after persistence.');
    }

    return expense;
  }
}
