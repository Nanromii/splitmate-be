import { Group, GroupMember } from '../../database';
import {
  GroupDetailResponseDto,
  GroupMemberResponseDto,
  GroupResponseDto,
} from './dto/response';

export const mapGroupToGroupResponse = (group: Group): GroupResponseDto => ({
  id: group.id,
  name: group.name,
  description: group.description ?? null,
  currency: group.currency,
  role: group.members?.[0]?.role,
  createdAt: group.createdAt,
  updatedAt: group.updatedAt,
});

export const mapGroupToGroupDetailResponse = (
  group: Group,
): GroupDetailResponseDto => ({
  ...mapGroupToGroupResponse(group),
  ownerId: group.ownerId ?? null,
});

export const mapGroupMemberToGroupMemberResponse = (
  member: GroupMember,
): GroupMemberResponseDto => ({
  memberId: member.id,
  userId: member.userId,
  name: member.user.displayName,
  email: member.user.email,
  avatarUrl: member.user.avatarUrl ?? null,
  role: member.role,
  joinedAt: member.createdAt,
});
