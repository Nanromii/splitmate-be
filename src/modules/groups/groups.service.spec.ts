jest.mock('uuid', () => ({
  v7: jest.fn(() => '01980000-0000-7000-8000-000000000030'),
}));

import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Currency, GroupRole, UserRole } from '../../common/enums';
import {
  GROUP_ERROR_MESSAGES,
  GROUP_INFO_MESSAGES,
} from '../../common/messages';
import type { CurrentUser } from '../../common/types';
import { Group, GroupMember, User } from '../../database';
import {
  GroupMemberRepository,
  GroupRepository,
  UserRepository,
} from '../repositories';
import { GroupsService } from './groups.service';

describe('GroupsService', () => {
  let service: GroupsService;
  let groupRepository: {
    createGroupWithOwner: jest.Mock;
    findGroupsByActiveUserId: jest.Mock;
    findGroupById: jest.Mock;
    findGroupByIdForActiveMember: jest.Mock;
    save: jest.Mock;
    softDeleteGroupById: jest.Mock;
    transferOwnership: jest.Mock;
  };
  let groupMemberRepository: {
    addOrReactivateMember: jest.Mock;
    findActiveMemberByGroupIdAndUserId: jest.Mock;
    findActiveMembersByGroupId: jest.Mock;
    isGroupOwner: jest.Mock;
    markMemberAsLeft: jest.Mock;
  };
  let userRepository: {
    findById: jest.Mock;
  };

  const now = new Date('2026-07-02T10:00:00.000Z');
  const ownerId = '01980000-0000-7000-8000-000000000001';
  const memberId = '01980000-0000-7000-8000-000000000002';
  const groupId = '01980000-0000-7000-8000-000000000010';
  const currentUser: CurrentUser = {
    id: ownerId,
    email: 'owner@example.com',
    role: UserRole.USER,
    sessionId: '01980000-0000-7000-8000-000000000099',
  };

  const makeGroup = (role = GroupRole.OWNER): Group =>
    ({
      id: groupId,
      name: 'Trip to Da Nang',
      description: 'Nhóm chi tiêu cho chuyến đi Đà Nẵng',
      currency: Currency.VND,
      ownerId,
      members: [
        {
          role,
        },
      ],
      createdAt: now,
      updatedAt: now,
    }) as Group;

  const makeMember = (
    role = GroupRole.MEMBER,
    userId = memberId,
  ): GroupMember =>
    ({
      id: '01980000-0000-7000-8000-000000000020',
      groupId,
      userId,
      role,
      createdAt: now,
      user: {
        id: userId,
        email: `${userId}@example.com`,
        displayName: 'Split Mate',
        avatarUrl: 'https://example.com/avatar.png',
      } as User,
    }) as GroupMember;

  beforeEach(async () => {
    groupRepository = {
      createGroupWithOwner: jest.fn(),
      findGroupsByActiveUserId: jest.fn(),
      findGroupById: jest.fn(),
      findGroupByIdForActiveMember: jest.fn(),
      save: jest.fn(),
      softDeleteGroupById: jest.fn(),
      transferOwnership: jest.fn(),
    };
    groupMemberRepository = {
      addOrReactivateMember: jest.fn(),
      findActiveMemberByGroupIdAndUserId: jest.fn(),
      findActiveMembersByGroupId: jest.fn(),
      isGroupOwner: jest.fn(),
      markMemberAsLeft: jest.fn(),
    };
    userRepository = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupsService,
        {
          provide: GroupRepository,
          useValue: groupRepository,
        },
        {
          provide: GroupMemberRepository,
          useValue: groupMemberRepository,
        },
        {
          provide: UserRepository,
          useValue: userRepository,
        },
      ],
    }).compile();

    service = module.get<GroupsService>(GroupsService);
  });

  it('should create a group and return the creator as owner', async () => {
    groupRepository.createGroupWithOwner.mockResolvedValue(makeGroup());

    const result = await service.createGroup(
      {
        name: ' Trip to Da Nang ',
        description: ' Nhóm chi tiêu cho chuyến đi Đà Nẵng ',
      },
      currentUser,
    );

    expect(groupRepository.createGroupWithOwner).toHaveBeenCalledWith({
      name: 'Trip to Da Nang',
      description: 'Nhóm chi tiêu cho chuyến đi Đà Nẵng',
      currency: Currency.VND,
      ownerId,
    });
    expect(result.role).toBe(GroupRole.OWNER);
  });

  it('should list groups for the current active member', async () => {
    groupRepository.findGroupsByActiveUserId.mockResolvedValue([
      [makeGroup(GroupRole.MEMBER)],
      1,
    ]);

    const result = await service.listMyGroups(currentUser, {
      page: 2,
      limit: 10,
    });

    expect(groupRepository.findGroupsByActiveUserId).toHaveBeenCalledWith({
      userId: ownerId,
      skip: 10,
      take: 10,
    });
    expect(result.items).toHaveLength(1);
    expect(result.items[0].role).toBe(GroupRole.MEMBER);
    expect(result.meta).toEqual({
      page: 2,
      limit: 10,
      total: 1,
      totalPages: 1,
    });
  });

  it('should return group detail for an active member', async () => {
    groupRepository.findGroupById.mockResolvedValue(makeGroup());
    groupRepository.findGroupByIdForActiveMember.mockResolvedValue(makeGroup());

    const result = await service.getGroupDetail(groupId, currentUser);

    expect(result.id).toBe(groupId);
    expect(result.ownerId).toBe(ownerId);
  });

  it('should block a non-member from viewing group detail', async () => {
    groupRepository.findGroupById.mockResolvedValue(makeGroup());
    groupRepository.findGroupByIdForActiveMember.mockResolvedValue(null);

    await expect(service.getGroupDetail(groupId, currentUser)).rejects.toThrow(
      GROUP_ERROR_MESSAGES.GROUP_FORBIDDEN,
    );
  });

  it('should block a regular member from updating a group', async () => {
    groupRepository.findGroupById.mockResolvedValue(makeGroup());
    groupMemberRepository.isGroupOwner.mockResolvedValue(false);

    await expect(
      service.updateGroup(
        groupId,
        {
          name: 'New name',
        },
        currentUser,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('should update a group when the current user is owner', async () => {
    const group = makeGroup();
    groupRepository.findGroupById.mockResolvedValue(group);
    groupMemberRepository.isGroupOwner.mockResolvedValue(true);
    groupRepository.save.mockImplementation((value: Group) =>
      Promise.resolve(value),
    );
    groupMemberRepository.findActiveMemberByGroupIdAndUserId.mockResolvedValue(
      makeMember(GroupRole.OWNER, ownerId),
    );

    const result = await service.updateGroup(
      groupId,
      {
        name: ' Trip to Da Nang 2026 ',
        currency: Currency.USD,
      },
      currentUser,
    );

    expect(groupRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Trip to Da Nang 2026',
        currency: Currency.USD,
        updatedBy: ownerId,
      }),
    );
    expect(result.name).toBe('Trip to Da Nang 2026');
  });

  it('should block a regular member from deleting a group', async () => {
    groupRepository.findGroupById.mockResolvedValue(makeGroup());
    groupMemberRepository.isGroupOwner.mockResolvedValue(false);

    await expect(service.deleteGroup(groupId, currentUser)).rejects.toThrow(
      GROUP_ERROR_MESSAGES.GROUP_OWNER_REQUIRED,
    );
  });

  it('should soft delete a group when the current user is owner', async () => {
    groupRepository.findGroupById.mockResolvedValue(makeGroup());
    groupMemberRepository.isGroupOwner.mockResolvedValue(true);
    groupRepository.softDeleteGroupById.mockResolvedValue(undefined);

    const result = await service.deleteGroup(groupId, currentUser);

    expect(groupRepository.softDeleteGroupById).toHaveBeenCalledWith(
      groupId,
      ownerId,
    );
    expect(result).toEqual({
      message: GROUP_INFO_MESSAGES.GROUP_DELETED,
    });
  });

  it('should block the owner from leaving a group', async () => {
    groupRepository.findGroupById.mockResolvedValue(makeGroup());
    groupMemberRepository.findActiveMemberByGroupIdAndUserId.mockResolvedValue(
      makeMember(GroupRole.OWNER, ownerId),
    );

    await expect(
      service.leaveGroup(groupId, currentUser),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should allow a regular member to leave a group', async () => {
    groupRepository.findGroupById.mockResolvedValue(makeGroup());
    groupMemberRepository.findActiveMemberByGroupIdAndUserId.mockResolvedValue(
      makeMember(GroupRole.MEMBER, ownerId),
    );
    groupMemberRepository.markMemberAsLeft.mockResolvedValue(undefined);

    const result = await service.leaveGroup(groupId, currentUser);

    expect(groupMemberRepository.markMemberAsLeft).toHaveBeenCalledWith(
      groupId,
      ownerId,
    );
    expect(result).toEqual({
      message: GROUP_INFO_MESSAGES.GROUP_LEFT,
    });
  });

  it('should list active group members without sensitive user fields', async () => {
    groupRepository.findGroupById.mockResolvedValue(makeGroup());
    groupRepository.findGroupByIdForActiveMember.mockResolvedValue(makeGroup());
    groupMemberRepository.findActiveMembersByGroupId.mockResolvedValue([
      makeMember(GroupRole.MEMBER, memberId),
    ]);

    const result = await service.listMembers(groupId, currentUser);

    expect(result).toEqual([
      {
        memberId: '01980000-0000-7000-8000-000000000020',
        userId: memberId,
        name: 'Split Mate',
        email: `${memberId}@example.com`,
        avatarUrl: 'https://example.com/avatar.png',
        role: GroupRole.MEMBER,
        joinedAt: now,
      },
    ]);
    expect(result[0]).not.toHaveProperty('passwordHash');
  });

  it('should add a member when the current user is owner', async () => {
    const member = makeMember(GroupRole.MEMBER, memberId);
    groupRepository.findGroupById.mockResolvedValue(makeGroup());
    groupMemberRepository.isGroupOwner.mockResolvedValue(true);
    userRepository.findById.mockResolvedValue(member.user);
    groupMemberRepository.findActiveMemberByGroupIdAndUserId
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(member);
    groupMemberRepository.addOrReactivateMember.mockResolvedValue(member);

    const result = await service.addMember(
      groupId,
      {
        userId: memberId,
      },
      currentUser,
    );

    expect(groupMemberRepository.addOrReactivateMember).toHaveBeenCalledWith({
      groupId,
      userId: memberId,
      actorId: ownerId,
    });
    expect(result.userId).toBe(memberId);
  });

  it('should block adding an already active member', async () => {
    const member = makeMember(GroupRole.MEMBER, memberId);
    groupRepository.findGroupById.mockResolvedValue(makeGroup());
    groupMemberRepository.isGroupOwner.mockResolvedValue(true);
    userRepository.findById.mockResolvedValue(member.user);
    groupMemberRepository.findActiveMemberByGroupIdAndUserId.mockResolvedValue(
      member,
    );

    await expect(
      service.addMember(
        groupId,
        {
          userId: memberId,
        },
        currentUser,
      ),
    ).rejects.toThrow(GROUP_ERROR_MESSAGES.GROUP_MEMBER_ALREADY_ACTIVE);
  });

  it('should transfer ownership to an active member', async () => {
    groupRepository.findGroupById.mockResolvedValue(makeGroup());
    groupMemberRepository.isGroupOwner.mockResolvedValue(true);
    groupMemberRepository.findActiveMemberByGroupIdAndUserId.mockResolvedValue(
      makeMember(GroupRole.MEMBER, memberId),
    );
    groupRepository.transferOwnership.mockResolvedValue(undefined);

    const result = await service.transferOwner(
      groupId,
      {
        newOwnerUserId: memberId,
      },
      currentUser,
    );

    expect(groupRepository.transferOwnership).toHaveBeenCalledWith({
      groupId,
      currentOwnerId: ownerId,
      newOwnerId: memberId,
    });
    expect(result).toEqual({
      message: GROUP_INFO_MESSAGES.GROUP_OWNER_TRANSFERRED,
    });
  });

  it('should block transferring ownership to self', async () => {
    groupRepository.findGroupById.mockResolvedValue(makeGroup());
    groupMemberRepository.isGroupOwner.mockResolvedValue(true);

    await expect(
      service.transferOwner(
        groupId,
        {
          newOwnerUserId: ownerId,
        },
        currentUser,
      ),
    ).rejects.toThrow(GROUP_ERROR_MESSAGES.GROUP_OWNER_TRANSFER_SELF);
  });

  it('should block transferring ownership to a non-member', async () => {
    groupRepository.findGroupById.mockResolvedValue(makeGroup());
    groupMemberRepository.isGroupOwner.mockResolvedValue(true);
    groupMemberRepository.findActiveMemberByGroupIdAndUserId.mockResolvedValue(
      null,
    );

    await expect(
      service.transferOwner(
        groupId,
        {
          newOwnerUserId: memberId,
        },
        currentUser,
      ),
    ).rejects.toThrow(
      GROUP_ERROR_MESSAGES.GROUP_OWNER_TRANSFER_TARGET_REQUIRED,
    );
  });
});
