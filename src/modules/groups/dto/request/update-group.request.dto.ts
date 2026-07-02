import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Currency } from '../../../../common/enums';
import { GROUP_ERROR_MESSAGES } from '../../../../common/messages';

export class UpdateGroupRequestDto {
  @ApiPropertyOptional({
    description: 'Tên nhóm chi tiêu.',
    example: 'Trip to Da Nang 2026',
  })
  @IsOptional()
  @IsString({ message: GROUP_ERROR_MESSAGES.GROUP_NAME_REQUIRED })
  @IsNotEmpty({ message: GROUP_ERROR_MESSAGES.GROUP_NAME_REQUIRED })
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    description: 'Mô tả mới của nhóm.',
    example: 'Updated description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Đơn vị tiền tệ mặc định của nhóm.',
    enum: Currency,
  })
  @IsOptional()
  @IsEnum(Currency, { message: GROUP_ERROR_MESSAGES.GROUP_CURRENCY_INVALID })
  currency?: Currency;
}
