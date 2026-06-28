import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { GroupMember } from '../../database';

@Injectable()
export class GroupMemberRepository extends Repository<GroupMember> {
  constructor(private readonly dataSource: DataSource) {
    super(GroupMember, dataSource.createEntityManager());
  }
}