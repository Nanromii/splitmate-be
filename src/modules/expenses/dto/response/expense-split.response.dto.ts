import { ApiProperty } from '@nestjs/swagger';
import { ExpenseUserResponseDto } from './expense-user.response.dto';

export class ExpenseSplitResponseDto {
  @ApiProperty()
  splitId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ type: ExpenseUserResponseDto })
  user: ExpenseUserResponseDto;

  @ApiProperty()
  amount: number;
}
