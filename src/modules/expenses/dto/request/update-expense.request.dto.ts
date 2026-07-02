import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { ExpenseSplitType } from '../../../../common/enums';
import { EXPENSE_ERROR_MESSAGES } from '../../../../common/messages';

export class UpdateExpenseRequestDto {
  @ApiPropertyOptional({
    description: 'Tên khoản chi.',
    example: 'Dinner updated',
  })
  @IsOptional()
  @IsString({ message: EXPENSE_ERROR_MESSAGES.EXPENSE_TITLE_REQUIRED })
  @IsNotEmpty({ message: EXPENSE_ERROR_MESSAGES.EXPENSE_TITLE_REQUIRED })
  title?: string;

  @ApiPropertyOptional({
    description: 'Mô tả khoản chi.',
    example: 'Updated description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Số tiền khoản chi, dùng integer theo đơn vị nhỏ nhất.',
    example: 360000,
    minimum: 1,
  })
  @IsOptional()
  @IsInt({ message: EXPENSE_ERROR_MESSAGES.EXPENSE_AMOUNT_INVALID })
  @Min(1, { message: EXPENSE_ERROR_MESSAGES.EXPENSE_AMOUNT_INVALID })
  amount?: number;

  @ApiPropertyOptional({
    description: 'ID thành viên đã trả tiền.',
    example: '01980000-0000-7000-8000-000000000001',
  })
  @IsOptional()
  @IsUUID('7')
  paidByUserId?: string;

  @ApiPropertyOptional({
    description: 'Danh sách ID thành viên tham gia chia tiền.',
    example: [
      '01980000-0000-7000-8000-000000000001',
      '01980000-0000-7000-8000-000000000002',
    ],
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty({
    message: EXPENSE_ERROR_MESSAGES.EXPENSE_PARTICIPANTS_REQUIRED,
  })
  @ArrayUnique({
    message: EXPENSE_ERROR_MESSAGES.EXPENSE_PARTICIPANTS_DUPLICATED,
  })
  @IsUUID('7', { each: true })
  participantIds?: string[];

  @ApiPropertyOptional({
    description: 'Thời điểm phát sinh khoản chi.',
    example: '2026-07-02T13:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  expenseDate?: string;

  @ApiPropertyOptional({
    description: 'Kiểu chia tiền. Phase hiện tại chỉ hỗ trợ EQUAL.',
    enum: ExpenseSplitType,
  })
  @IsOptional()
  @IsEnum(ExpenseSplitType, {
    message: EXPENSE_ERROR_MESSAGES.EXPENSE_SPLIT_TYPE_UNSUPPORTED,
  })
  splitType?: ExpenseSplitType;
}
