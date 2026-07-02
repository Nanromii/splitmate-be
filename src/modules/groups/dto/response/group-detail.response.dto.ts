import { ApiPropertyOptional } from '@nestjs/swagger';
import { GroupResponseDto } from './group.response.dto';

export class GroupDetailResponseDto extends GroupResponseDto {
  @ApiPropertyOptional()
  ownerId?: string | null;
}
