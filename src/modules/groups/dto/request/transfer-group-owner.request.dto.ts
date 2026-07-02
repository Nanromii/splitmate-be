import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class TransferGroupOwnerRequestDto {
  @ApiProperty({
    description: 'ID thành viên sẽ nhận quyền chủ nhóm.',
    example: '01980000-0000-7000-8000-000000000002',
  })
  @IsUUID('7')
  newOwnerUserId: string;
}
