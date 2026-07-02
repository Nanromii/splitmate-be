import { ApiProperty } from '@nestjs/swagger';
import { ExpenseResponseDto } from './expense.response.dto';
import { ExpenseSplitResponseDto } from './expense-split.response.dto';

export class ExpenseDetailResponseDto extends ExpenseResponseDto {
  @ApiProperty({ type: ExpenseSplitResponseDto, isArray: true })
  splits: ExpenseSplitResponseDto[];
}
