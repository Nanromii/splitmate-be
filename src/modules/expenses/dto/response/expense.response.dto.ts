import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Currency, ExpenseSplitType } from '../../../../common/enums';
import { ExpenseUserResponseDto } from './expense-user.response.dto';

export class ExpenseResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  groupId: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  description?: string | null;

  @ApiProperty()
  amount: number;

  @ApiProperty({ enum: Currency })
  currency: Currency;

  @ApiProperty({ enum: ExpenseSplitType })
  splitType: ExpenseSplitType;

  @ApiProperty()
  paidByUserId: string;

  @ApiPropertyOptional({ type: ExpenseUserResponseDto })
  paidByUser?: ExpenseUserResponseDto | null;

  @ApiProperty()
  participantCount: number;

  @ApiProperty()
  expenseDate: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
