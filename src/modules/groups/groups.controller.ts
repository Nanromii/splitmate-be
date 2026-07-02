import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentAuthUser } from '../../common/decorators';
import type { CurrentUser } from '../../common/types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  AddGroupMemberRequestDto,
  CreateGroupRequestDto,
  ListGroupsRequestDto,
  TransferGroupOwnerRequestDto,
  UpdateGroupRequestDto,
} from './dto/request';
import {
  GroupActionResponseDto,
  GroupDetailResponseDto,
  GroupListResponseDto,
  GroupMemberResponseDto,
  GroupResponseDto,
} from './dto/response';
import { GroupsService } from './groups.service';

@ApiTags('Groups')
@ApiBearerAuth()
@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo nhóm chi tiêu' })
  @ApiBody({ type: CreateGroupRequestDto })
  @ApiCreatedResponse({ type: GroupResponseDto })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai bearer token.' })
  @ApiBadRequestResponse({ description: 'Dữ liệu tạo nhóm không hợp lệ.' })
  createGroup(
    @Body() dto: CreateGroupRequestDto,
    @CurrentAuthUser() currentUser: CurrentUser,
  ): Promise<GroupResponseDto> {
    return this.groupsService.createGroup(dto, currentUser);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách nhóm của người dùng hiện tại' })
  @ApiOkResponse({ type: GroupListResponseDto })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai bearer token.' })
  listMyGroups(
    @CurrentAuthUser() currentUser: CurrentUser,
    @Query() query: ListGroupsRequestDto,
  ): Promise<GroupListResponseDto> {
    return this.groupsService.listMyGroups(currentUser, query);
  }

  @Get(':groupId')
  @ApiOperation({ summary: 'Lấy chi tiết một nhóm' })
  @ApiOkResponse({ type: GroupDetailResponseDto })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai bearer token.' })
  @ApiForbiddenResponse({ description: 'Người dùng không thuộc nhóm.' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy nhóm.' })
  getGroupDetail(
    @Param('groupId', new ParseUUIDPipe({ version: '7' })) groupId: string,
    @CurrentAuthUser() currentUser: CurrentUser,
  ): Promise<GroupDetailResponseDto> {
    return this.groupsService.getGroupDetail(groupId, currentUser);
  }

  @Patch(':groupId')
  @ApiOperation({ summary: 'Cập nhật thông tin nhóm' })
  @ApiBody({ type: UpdateGroupRequestDto })
  @ApiOkResponse({ type: GroupDetailResponseDto })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai bearer token.' })
  @ApiForbiddenResponse({ description: 'Chỉ chủ nhóm được cập nhật nhóm.' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy nhóm.' })
  @ApiBadRequestResponse({ description: 'Dữ liệu cập nhật nhóm không hợp lệ.' })
  updateGroup(
    @Param('groupId', new ParseUUIDPipe({ version: '7' })) groupId: string,
    @Body() dto: UpdateGroupRequestDto,
    @CurrentAuthUser() currentUser: CurrentUser,
  ): Promise<GroupDetailResponseDto> {
    return this.groupsService.updateGroup(groupId, dto, currentUser);
  }

  @Delete(':groupId')
  @ApiOperation({ summary: 'Xóa mềm nhóm' })
  @ApiOkResponse({ type: GroupActionResponseDto })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai bearer token.' })
  @ApiForbiddenResponse({ description: 'Chỉ chủ nhóm được xóa nhóm.' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy nhóm.' })
  deleteGroup(
    @Param('groupId', new ParseUUIDPipe({ version: '7' })) groupId: string,
    @CurrentAuthUser() currentUser: CurrentUser,
  ): Promise<GroupActionResponseDto> {
    return this.groupsService.deleteGroup(groupId, currentUser);
  }

  @Post(':groupId/leave')
  @ApiOperation({ summary: 'Rời nhóm' })
  @ApiOkResponse({ type: GroupActionResponseDto })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai bearer token.' })
  @ApiForbiddenResponse({ description: 'Người dùng không thuộc nhóm.' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy nhóm.' })
  @ApiBadRequestResponse({ description: 'Chủ nhóm chưa thể rời nhóm.' })
  leaveGroup(
    @Param('groupId', new ParseUUIDPipe({ version: '7' })) groupId: string,
    @CurrentAuthUser() currentUser: CurrentUser,
  ): Promise<GroupActionResponseDto> {
    return this.groupsService.leaveGroup(groupId, currentUser);
  }

  @Get(':groupId/members')
  @ApiOperation({ summary: 'Lấy danh sách thành viên trong nhóm' })
  @ApiOkResponse({ type: GroupMemberResponseDto, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai bearer token.' })
  @ApiForbiddenResponse({ description: 'Người dùng không thuộc nhóm.' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy nhóm.' })
  listMembers(
    @Param('groupId', new ParseUUIDPipe({ version: '7' })) groupId: string,
    @CurrentAuthUser() currentUser: CurrentUser,
  ): Promise<GroupMemberResponseDto[]> {
    return this.groupsService.listMembers(groupId, currentUser);
  }

  @Post(':groupId/members')
  @ApiOperation({ summary: 'Thêm hoặc kích hoạt lại thành viên trong nhóm' })
  @ApiBody({ type: AddGroupMemberRequestDto })
  @ApiCreatedResponse({ type: GroupMemberResponseDto })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai bearer token.' })
  @ApiForbiddenResponse({ description: 'Chỉ chủ nhóm được thêm thành viên.' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy nhóm hoặc người dùng.' })
  @ApiBadRequestResponse({
    description: 'Người dùng đã là thành viên đang hoạt động của nhóm.',
  })
  addMember(
    @Param('groupId', new ParseUUIDPipe({ version: '7' })) groupId: string,
    @Body() dto: AddGroupMemberRequestDto,
    @CurrentAuthUser() currentUser: CurrentUser,
  ): Promise<GroupMemberResponseDto> {
    return this.groupsService.addMember(groupId, dto, currentUser);
  }

  @Post(':groupId/transfer-owner')
  @ApiOperation({ summary: 'Chuyển quyền chủ nhóm cho thành viên khác' })
  @ApiBody({ type: TransferGroupOwnerRequestDto })
  @ApiOkResponse({ type: GroupActionResponseDto })
  @ApiUnauthorizedResponse({ description: 'Thiếu hoặc sai bearer token.' })
  @ApiForbiddenResponse({ description: 'Chỉ chủ nhóm được chuyển quyền.' })
  @ApiNotFoundResponse({ description: 'Không tìm thấy nhóm.' })
  @ApiBadRequestResponse({
    description: 'Người nhận quyền không hợp lệ hoặc không phải thành viên.',
  })
  transferOwner(
    @Param('groupId', new ParseUUIDPipe({ version: '7' })) groupId: string,
    @Body() dto: TransferGroupOwnerRequestDto,
    @CurrentAuthUser() currentUser: CurrentUser,
  ): Promise<GroupActionResponseDto> {
    return this.groupsService.transferOwner(groupId, dto, currentUser);
  }
}
