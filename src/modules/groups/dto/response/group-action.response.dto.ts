import { ApiProperty } from '@nestjs/swagger';

export class GroupActionResponseDto {
  @ApiProperty()
  message: string;
}
