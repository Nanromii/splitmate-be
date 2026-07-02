import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExpenseUserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional()
  avatarUrl?: string | null;
}
