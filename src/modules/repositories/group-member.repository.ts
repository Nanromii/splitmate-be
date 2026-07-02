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

  findActiveMembersByGroupIdAndUserIds(
    groupId: string,
    userIds: string[],
  ): Promise<GroupMember[]> {
    if (userIds.length === 0) {
      return Promise.resolve([]);
    }

    return this.createQueryBuilder('member')
      .leftJoinAndSelect('member.user', 'user')
      .where('member.group_id = :groupId', { groupId })
      .andWhere('member.user_id IN (:...userIds)', { userIds })
      .andWhere('member.status = :status', {
        status: GroupMemberStatus.ACTIVE,
      })
      .andWhere('member.deleted_at IS NULL')
      .getMany();
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

  async addOrReactivateMember(params: {
    groupId: string;
    userId: string;
    actorId: string;
  }): Promise<GroupMember> {
    const existingMember = await this.findMemberByGroupIdAndUserId(
      params.groupId,
      params.userId,
    );

    if (existingMember) {
      existingMember.role = GroupRole.MEMBER;
      existingMember.status = GroupMemberStatus.ACTIVE;
      existingMember.deletedAt = null;
      existingMember.updatedBy = params.actorId;
      existingMember.deletedBy = null;

      return this.save(existingMember);
    }

    const member = this.create({
      groupId: params.groupId,
      userId: params.userId,
      role: GroupRole.MEMBER,
      status: GroupMemberStatus.ACTIVE,
      createdBy: params.actorId,
    });

    return this.save(member);
  }
}
