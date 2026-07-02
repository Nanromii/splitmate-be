import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { GroupMemberStatus, GroupRole } from '../../common/enums';
import { GroupMember } from '../../database';

@Injectable()
export class GroupMemberRepository extends Repository<GroupMember> {
  constructor(private readonly dataSource: DataSource) {
    super(GroupMember, dataSource.createEntityManager());
  }

  findMemberByGroupIdAndUserId(
    groupId: string,
    userId: string,
  ): Promise<GroupMember | null> {
    return this.findOne({
      where: {
        groupId,
        userId,
      },
      withDeleted: true,
    });
  }

  findActiveMemberByGroupIdAndUserId(
    groupId: string,
    userId: string,
  ): Promise<GroupMember | null> {
    return this.findOne({
      where: {
        groupId,
        userId,
        status: GroupMemberStatus.ACTIVE,
      },
    });
  }

  findActiveMembersByGroupId(groupId: string): Promise<GroupMember[]> {
    return this.find({
      where: {
        groupId,
        status: GroupMemberStatus.ACTIVE,
      },
      relations: {
        user: true,
      },
      order: {
        createdAt: 'ASC',
      },
    });
  }

  async isGroupOwner(groupId: string, userId: string): Promise<boolean> {
    const ownerCount = await this.count({
      where: {
        groupId,
        userId,
        role: GroupRole.OWNER,
        status: GroupMemberStatus.ACTIVE,
      },
    });

    return ownerCount > 0;
  }

  async markMemberAsLeft(groupId: string, userId: string): Promise<void> {
    await this.update(
      {
        groupId,
        userId,
        status: GroupMemberStatus.ACTIVE,
      },
      {
        status: GroupMemberStatus.LEFT,
        deletedAt: new Date(),
        updatedBy: userId,
        deletedBy: userId,
      },
    );
  }
}
