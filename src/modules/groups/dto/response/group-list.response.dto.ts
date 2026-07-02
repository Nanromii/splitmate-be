import { ApiProperty } from '@nestjs/swagger';
import { GroupResponseDto } from './group.response.dto';
import { PaginationMetaResponseDto } from './pagination-meta.response.dto';

export class GroupListResponseDto {
  @ApiProperty({ type: GroupResponseDto, isArray: true })
  items: GroupResponseDto[];

  @ApiProperty({ type: PaginationMetaResponseDto })
  meta: PaginationMetaResponseDto;
}
