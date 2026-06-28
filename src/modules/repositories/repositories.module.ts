import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense, Group, GroupMember, Settlement, User } from '../../database';
import { UserRepository } from './user.repository';
import { ExpenseRepository } from './expense.repository';
import { GroupRepository } from './group.repository';
import { GroupMemberRepository } from './group-member.repository';
import { SettlementRepository } from './settlement.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Expense, Group, GroupMember, Settlement]),
  ],
  providers: [
    UserRepository,
    ExpenseRepository,
    GroupRepository,
    GroupMemberRepository,
    SettlementRepository,
  ],
  exports: [
    UserRepository,
    ExpenseRepository,
    GroupRepository,
    GroupMemberRepository,
    SettlementRepository,
  ]
})
export class RepositoriesModule {}
