import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ExpenseSplitType } from '../../common/enums';
import {
  EXPENSE_ERROR_MESSAGES,
  EXPENSE_INFO_MESSAGES,
  GROUP_ERROR_MESSAGES,
} from '../../common/messages';
import type { CurrentUser } from '../../common/types';
import { Expense, Group } from '../../database';
import {
  ExpenseRepository,
  ExpenseSplitInput,
  GroupMemberRepository,
  GroupRepository,
} from '../repositories';
import {
  CreateExpenseRequestDto,
  UpdateExpenseRequestDto,
} from './dto/request';
import {
  ExpenseActionResponseDto,
  ExpenseDetailResponseDto,
  ExpenseResponseDto,
} from './dto/response';
import {
  mapExpenseToDetailResponse,
  mapExpenseToResponse,
} from './expenses.mapper';

@Injectable()
export class ExpensesService {
  constructor(
    private readonly expenseRepository: ExpenseRepository,
    private readonly groupRepository: GroupRepository,
    private readonly groupMemberRepository: GroupMemberRepository,
  ) {}

  async createExpense(
    groupId: string,
    dto: CreateExpenseRequestDto,
    currentUser: CurrentUser,
  ): Promise<ExpenseDetailResponseDto> {
    const group = await this.findGroupForActiveMember(groupId, currentUser.id);
    this.assertEqualSplitType(dto.splitType);
    const title = this.normalizeRequiredTitle(dto.title);
    const participantIds = this.normalizeParticipantIds(dto.participantIds);

    await this.assertPayerAndParticipantsAreActiveMembers(
      groupId,
      dto.paidByUserId,
      participantIds,
    );

    const splits = this.calculateEqualSplits(dto.amount, participantIds);
    const expense = await this.expenseRepository.createExpenseWithSplits({
      groupId,
      title,
      note: this.normalizeOptionalText(dto.description),
      amount: dto.amount,
      currency: group.currency,
      paidById: dto.paidByUserId,
      expenseDate: dto.expenseDate ? new Date(dto.expenseDate) : new Date(),
      createdBy: currentUser.id,
      splits,
    });

    return mapExpenseToDetailResponse(expense);
  }

  async listExpenses(
    groupId: string,
    currentUser: CurrentUser,
  ): Promise<ExpenseResponseDto[]> {
    await this.findGroupForActiveMember(groupId, currentUser.id);

    const expenses =
      await this.expenseRepository.findExpensesByGroupId(groupId);

    return expenses.map((expense) => mapExpenseToResponse(expense));
  }

  async getExpenseDetail(
    groupId: string,
    expenseId: string,
    currentUser: CurrentUser,
  ): Promise<ExpenseDetailResponseDto> {
    await this.findGroupForActiveMember(groupId, currentUser.id);
    const expense = await this.findExpenseDetail(groupId, expenseId);

    return mapExpenseToDetailResponse(expense);
  }

  async updateExpense(
    groupId: string,
    expenseId: string,
    dto: UpdateExpenseRequestDto,
    currentUser: CurrentUser,
  ): Promise<ExpenseDetailResponseDto> {
    await this.findGroupForActiveMember(groupId, currentUser.id);
    this.assertEqualSplitType(dto.splitType);
    const existingExpense = await this.findExpenseDetail(groupId, expenseId);
    const shouldReplaceSplits =
      dto.amount !== undefined ||
      dto.paidByUserId !== undefined ||
      dto.participantIds !== undefined;
    const participantIds =
      dto.participantIds ?? existingExpense.splits.map((split) => split.userId);
    const paidByUserId = dto.paidByUserId ?? existingExpense.paidById;
    const amount =
      dto.amount !== undefined ? dto.amount : Number(existingExpense.amount);

    if (!paidByUserId) {
      throw new BadRequestException(
        EXPENSE_ERROR_MESSAGES.EXPENSE_PAYER_NOT_GROUP_MEMBER,
      );
    }

    let splits: ExpenseSplitInput[] | undefined;

    if (shouldReplaceSplits) {
      const normalizedParticipantIds =
        this.normalizeParticipantIds(participantIds);

      await this.assertPayerAndParticipantsAreActiveMembers(
        groupId,
        paidByUserId,
        normalizedParticipantIds,
      );

      splits = this.calculateEqualSplits(amount, normalizedParticipantIds);
    }

    const expense =
      await this.expenseRepository.updateExpenseWithOptionalSplits(
        expenseId,
        groupId,
        {
          ...(dto.title !== undefined
            ? { title: this.normalizeRequiredTitle(dto.title) }
            : {}),
          ...(dto.description !== undefined
            ? { note: this.normalizeOptionalText(dto.description) }
            : {}),
          ...(dto.amount !== undefined ? { amount } : {}),
          ...(dto.paidByUserId !== undefined ? { paidById: paidByUserId } : {}),
          ...(dto.expenseDate !== undefined
            ? { expenseDate: new Date(dto.expenseDate) }
            : {}),
          updatedBy: currentUser.id,
          splits,
        },
      );

    return mapExpenseToDetailResponse(expense);
  }

  async deleteExpense(
    groupId: string,
    expenseId: string,
    currentUser: CurrentUser,
  ): Promise<ExpenseActionResponseDto> {
    await this.findGroupForActiveMember(groupId, currentUser.id);
    await this.findExpense(groupId, expenseId);
    await this.expenseRepository.softDeleteExpenseWithSplits(
      expenseId,
      currentUser.id,
    );

    return {
      message: EXPENSE_INFO_MESSAGES.EXPENSE_DELETED,
    };
  }

  private async findGroupForActiveMember(
    groupId: string,
    userId: string,
  ): Promise<Group> {
    const group = await this.groupRepository.findGroupById(groupId);

    if (!group) {
      throw new NotFoundException(GROUP_ERROR_MESSAGES.GROUP_NOT_FOUND);
    }

    const groupForMember =
      await this.groupRepository.findGroupByIdForActiveMember(groupId, userId);

    if (!groupForMember) {
      throw new ForbiddenException(EXPENSE_ERROR_MESSAGES.EXPENSE_FORBIDDEN);
    }

    return group;
  }

  private async findExpense(
    groupId: string,
    expenseId: string,
  ): Promise<Expense> {
    const expense = await this.expenseRepository.findExpenseByIdAndGroupId(
      expenseId,
      groupId,
    );

    if (!expense) {
      throw new NotFoundException(EXPENSE_ERROR_MESSAGES.EXPENSE_NOT_FOUND);
    }

    return expense;
  }

  private async findExpenseDetail(
    groupId: string,
    expenseId: string,
  ): Promise<Expense> {
    const expense =
      await this.expenseRepository.findExpenseDetailByIdAndGroupId(
        expenseId,
        groupId,
      );

    if (!expense) {
      throw new NotFoundException(EXPENSE_ERROR_MESSAGES.EXPENSE_NOT_FOUND);
    }

    return expense;
  }

  private async assertPayerAndParticipantsAreActiveMembers(
    groupId: string,
    paidByUserId: string,
    participantIds: string[],
  ): Promise<void> {
    const memberIds = [...new Set([paidByUserId, ...participantIds])];
    const activeMembers =
      await this.groupMemberRepository.findActiveMembersByGroupIdAndUserIds(
        groupId,
        memberIds,
      );
    const activeMemberIds = new Set(
      activeMembers.map((member) => member.userId),
    );

    if (!activeMemberIds.has(paidByUserId)) {
      throw new BadRequestException(
        EXPENSE_ERROR_MESSAGES.EXPENSE_PAYER_NOT_GROUP_MEMBER,
      );
    }

    if (
      participantIds.some(
        (participantId) => !activeMemberIds.has(participantId),
      )
    ) {
      throw new BadRequestException(
        EXPENSE_ERROR_MESSAGES.EXPENSE_PARTICIPANT_NOT_GROUP_MEMBER,
      );
    }
  }

  private assertEqualSplitType(splitType?: ExpenseSplitType): void {
    if (splitType && splitType !== ExpenseSplitType.EQUAL) {
      throw new BadRequestException(
        EXPENSE_ERROR_MESSAGES.EXPENSE_SPLIT_TYPE_UNSUPPORTED,
      );
    }
  }

  private normalizeRequiredTitle(value: string): string {
    const title = value.trim();

    if (!title) {
      throw new BadRequestException(
        EXPENSE_ERROR_MESSAGES.EXPENSE_TITLE_REQUIRED,
      );
    }

    return title;
  }

  private normalizeOptionalText(value?: string): string | null {
    if (value === undefined) {
      return null;
    }

    const text = value.trim();

    return text || null;
  }

  private normalizeParticipantIds(participantIds: string[]): string[] {
    if (participantIds.length === 0) {
      throw new BadRequestException(
        EXPENSE_ERROR_MESSAGES.EXPENSE_PARTICIPANTS_REQUIRED,
      );
    }

    if (new Set(participantIds).size !== participantIds.length) {
      throw new BadRequestException(
        EXPENSE_ERROR_MESSAGES.EXPENSE_PARTICIPANTS_DUPLICATED,
      );
    }

    return participantIds;
  }

  private calculateEqualSplits(
    amount: number,
    participantIds: string[],
  ): ExpenseSplitInput[] {
    const baseAmount = Math.floor(amount / participantIds.length);
    const remainder = amount % participantIds.length;

    return participantIds.map((userId, index) => ({
      userId,
      amount: baseAmount + (index < remainder ? 1 : 0),
    }));
  }
}
