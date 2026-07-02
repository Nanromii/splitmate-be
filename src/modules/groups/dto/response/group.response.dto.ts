import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Currency, GroupRole } from '../../../../common/enums';

export class GroupResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  description?: string | null;

  @ApiProperty({ enum: Currency })
  currency: Currency;

  @ApiPropertyOptional({ enum: GroupRole })
  role?: GroupRole;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
