import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Currency, GroupRole } from '../../common/enums';
import {
  GROUP_ERROR_MESSAGES,
  GROUP_INFO_MESSAGES,
} from '../../common/messages';
import type { CurrentUser } from '../../common/types';
import { Group } from '../../database';
import { GroupMemberRepository, GroupRepository } from '../repositories';
import {
  mapGroupMemberToGroupMemberResponse,
  mapGroupToGroupDetailResponse,
  mapGroupToGroupResponse,
} from './groups.mapper';
import {
  CreateGroupRequestDto,
  ListGroupsRequestDto,
  UpdateGroupRequestDto,
} from './dto/request';
import {
  GroupActionResponseDto,
  GroupDetailResponseDto,
  GroupListResponseDto,
  GroupMemberResponseDto,
  GroupResponseDto,
} from './dto/response';

const DEFAULT_GROUP_LIST_PAGE = 1;
const DEFAULT_GROUP_LIST_LIMIT = 20;

@Injectable()
export class GroupsService {
  constructor(
    private readonly groupRepository: GroupRepository,
    private readonly groupMemberRepository: GroupMemberRepository,
  ) {}

  async createGroup(
    dto: CreateGroupRequestDto,
    currentUser: CurrentUser,
  ): Promise<GroupResponseDto> {
    const name = this.normalizeRequiredName(dto.name);
    const group = await this.groupRepository.createGroupWithOwner({
      name,
      description: this.normalizeOptionalText(dto.description),
      currency: dto.currency ?? Currency.VND,
      ownerId: currentUser.id,
    });

    group.members = [
      {
        role: GroupRole.OWNER,
      },
    ] as Group['members'];

    return mapGroupToGroupResponse(group);
  }

  async listMyGroups(
    currentUser: CurrentUser,
    query: ListGroupsRequestDto,
  ): Promise<GroupListResponseDto> {
    const page = query.page ?? DEFAULT_GROUP_LIST_PAGE;
    const limit = query.limit ?? DEFAULT_GROUP_LIST_LIMIT;
    const [groups, total] = await this.groupRepository.findGroupsByActiveUserId(
      {
        userId: currentUser.id,
        skip: (page - 1) * limit,
        take: limit,
      },
    );

    return {
      items: groups.map((group) => mapGroupToGroupResponse(group)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getGroupDetail(
    groupId: string,
    currentUser: CurrentUser,
  ): Promise<GroupDetailResponseDto> {
    const group = await this.findGroupForActiveMember(groupId, currentUser.id);

    return mapGroupToGroupDetailResponse(group);
  }

  async updateGroup(
    groupId: string,
    dto: UpdateGroupRequestDto,
    currentUser: CurrentUser,
  ): Promise<GroupDetailResponseDto> {
    const group = await this.findExistingGroup(groupId);

    await this.assertCurrentUserIsOwner(groupId, currentUser.id);

    if (dto.name !== undefined) {
      group.name = this.normalizeRequiredName(dto.name);
    }

    if (dto.description !== undefined) {
      group.description =
        this.normalizeOptionalText(dto.description) ?? undefined;
    }

    if (dto.currency !== undefined) {
      group.currency = dto.currency;
    }

    group.updatedBy = currentUser.id;

    const savedGroup = await this.groupRepository.save(group);
    const member =
      await this.groupMemberRepository.findActiveMemberByGroupIdAndUserId(
        groupId,
        currentUser.id,
      );

    savedGroup.members = member ? [member] : [];

    return mapGroupToGroupDetailResponse(savedGroup);
  }

  async deleteGroup(
    groupId: string,
    currentUser: CurrentUser,
  ): Promise<GroupActionResponseDto> {
    await this.findExistingGroup(groupId);
    await this.assertCurrentUserIsOwner(groupId, currentUser.id);
    await this.groupRepository.softDeleteGroupById(groupId, currentUser.id);

    return {
      message: GROUP_INFO_MESSAGES.GROUP_DELETED,
    };
  }

  async leaveGroup(
    groupId: string,
    currentUser: CurrentUser,
  ): Promise<GroupActionResponseDto> {
    await this.findExistingGroup(groupId);

    const member =
      await this.groupMemberRepository.findActiveMemberByGroupIdAndUserId(
        groupId,
        currentUser.id,
      );

    if (!member) {
      throw new ForbiddenException(GROUP_ERROR_MESSAGES.GROUP_FORBIDDEN);
    }

    if (member.role === GroupRole.OWNER) {
      throw new BadRequestException(
        GROUP_ERROR_MESSAGES.GROUP_OWNER_CANNOT_LEAVE,
      );
    }

    await this.groupMemberRepository.markMemberAsLeft(groupId, currentUser.id);

    return {
      message: GROUP_INFO_MESSAGES.GROUP_LEFT,
    };
  }

  async listMembers(
    groupId: string,
    currentUser: CurrentUser,
  ): Promise<GroupMemberResponseDto[]> {
    await this.findGroupForActiveMember(groupId, currentUser.id);

    const members =
      await this.groupMemberRepository.findActiveMembersByGroupId(groupId);

    return members.map((member) => mapGroupMemberToGroupMemberResponse(member));
  }

  private async findExistingGroup(groupId: string): Promise<Group> {
    const group = await this.groupRepository.findGroupById(groupId);

    if (!group) {
      throw new NotFoundException(GROUP_ERROR_MESSAGES.GROUP_NOT_FOUND);
    }

    return group;
  }

  private async findGroupForActiveMember(
    groupId: string,
    userId: string,
  ): Promise<Group> {
    await this.findExistingGroup(groupId);

    const group = await this.groupRepository.findGroupByIdForActiveMember(
      groupId,
      userId,
    );

    if (!group) {
      throw new ForbiddenException(GROUP_ERROR_MESSAGES.GROUP_FORBIDDEN);
    }

    return group;
  }

  private async assertCurrentUserIsOwner(
    groupId: string,
    userId: string,
  ): Promise<void> {
    const isOwner = await this.groupMemberRepository.isGroupOwner(
      groupId,
      userId,
    );

    if (!isOwner) {
      throw new ForbiddenException(GROUP_ERROR_MESSAGES.GROUP_OWNER_REQUIRED);
    }
  }

  private normalizeRequiredName(value: string): string {
    const name = value.trim();

    if (!name) {
      throw new BadRequestException(GROUP_ERROR_MESSAGES.GROUP_NAME_REQUIRED);
    }

    return name;
  }

  private normalizeOptionalText(value?: string): string | null {
    if (value === undefined) {
      return null;
    }

    const text = value.trim();

    return text || null;
  }
}
