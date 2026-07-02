import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AddGroupMemberRequestDto {
  @ApiProperty({
    description: 'ID người dùng cần thêm vào nhóm.',
    example: '01980000-0000-7000-8000-000000000002',
  })
  @IsUUID('7')
  userId: string;
}
