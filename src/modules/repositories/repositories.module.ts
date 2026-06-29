import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Expense,
  Group,
  GroupMember,
  Session,
  Settlement,
  User,
} from '../../database';
import { UserRepository } from './user.repository';
import { ExpenseRepository } from './expense.repository';
import { GroupRepository } from './group.repository';
import { GroupMemberRepository } from './group-member.repository';
import { SettlementRepository } from './settlement.repository';
import { SessionRepository } from './session.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Expense,
      Group,
      GroupMember,
      Settlement,
      Session,
    ]),
  ],
  providers: [
    UserRepository,
    ExpenseRepository,
    GroupRepository,
    GroupMemberRepository,
    SettlementRepository,
    SessionRepository,
  ],
  exports: [
    UserRepository,
    ExpenseRepository,
    GroupRepository,
    GroupMemberRepository,
    SettlementRepository,
    SessionRepository,
  ],
})
export class RepositoriesModule {}
