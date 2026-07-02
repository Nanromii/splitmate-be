import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { GroupRole } from '../../../../common/enums';

export class GroupMemberResponseDto {
  @ApiProperty()
  memberId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional()
  avatarUrl?: string | null;

  @ApiProperty({ enum: GroupRole })
  role: GroupRole;

  @ApiProperty()
  joinedAt: Date;
}
