import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Currency, GroupMemberStatus, GroupRole } from '../../common/enums';
import { Group, GroupMember } from '../../database';

@Injectable()
export class GroupRepository extends Repository<Group> {
  constructor(private readonly dataSource: DataSource) {
    super(Group, dataSource.createEntityManager());
  }

  async createGroupWithOwner(params: {
    name: string;
    description?: string | null;
    currency: Currency;
    ownerId: string;
  }): Promise<Group> {
    return this.dataSource.transaction(async (manager) => {
      const groupRepository = manager.getRepository(Group);
      const groupMemberRepository = manager.getRepository(GroupMember);

      const group = groupRepository.create({
        name: params.name,
        description: params.description ?? undefined,
        currency: params.currency,
        ownerId: params.ownerId,
        createdBy: params.ownerId,
      });

      const savedGroup = await groupRepository.save(group);

      const ownerMember = groupMemberRepository.create({
        groupId: savedGroup.id,
        userId: params.ownerId,
        role: GroupRole.OWNER,
        status: GroupMemberStatus.ACTIVE,
        createdBy: params.ownerId,
      });

      await groupMemberRepository.save(ownerMember);

      return savedGroup;
    });
  }

  findGroupById(groupId: string): Promise<Group | null> {
    return this.findOne({
      where: {
        id: groupId,
      },
    });
  }

  findGroupByIdForActiveMember(
    groupId: string,
    userId: string,
  ): Promise<Group | null> {
    return this.createQueryBuilder('group')
      .innerJoinAndSelect(
        'group.members',
        'member',
        [
          'member.user_id = :userId',
          'member.status = :status',
          'member.deleted_at IS NULL',
        ].join(' AND '),
        {
          userId,
          status: GroupMemberStatus.ACTIVE,
        },
      )
      .where('group.id = :groupId', { groupId })
      .andWhere('group.deleted_at IS NULL')
      .getOne();
  }

  findGroupsByActiveUserId(params: {
    userId: string;
    skip: number;
    take: number;
  }): Promise<[Group[], number]> {
    return this.createQueryBuilder('group')
      .innerJoinAndSelect(
        'group.members',
        'member',
        [
          'member.user_id = :userId',
          'member.status = :status',
          'member.deleted_at IS NULL',
        ].join(' AND '),
        {
          userId: params.userId,
          status: GroupMemberStatus.ACTIVE,
        },
      )
      .where('group.deleted_at IS NULL')
      .orderBy('group.created_at', 'DESC')
      .skip(params.skip)
      .take(params.take)
      .getManyAndCount();
  }

  async softDeleteGroupById(groupId: string, userId: string): Promise<void> {
    await this.update(
      {
        id: groupId,
      },
      {
        deletedAt: new Date(),
        deletedBy: userId,
      },
    );
  }

  async transferOwnership(params: {
    groupId: string;
    currentOwnerId: string;
    newOwnerId: string;
  }): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      await manager.update(
        Group,
        {
          id: params.groupId,
        },
        {
          ownerId: params.newOwnerId,
          updatedBy: params.currentOwnerId,
        },
      );

      await manager.update(
        GroupMember,
        {
          groupId: params.groupId,
          userId: params.currentOwnerId,
          role: GroupRole.OWNER,
          status: GroupMemberStatus.ACTIVE,
        },
        {
          role: GroupRole.MEMBER,
          updatedBy: params.currentOwnerId,
        },
      );

      await manager.update(
        GroupMember,
        {
          groupId: params.groupId,
          userId: params.newOwnerId,
          status: GroupMemberStatus.ACTIVE,
        },
        {
          role: GroupRole.OWNER,
          updatedBy: params.currentOwnerId,
        },
      );
    });
  }
}
