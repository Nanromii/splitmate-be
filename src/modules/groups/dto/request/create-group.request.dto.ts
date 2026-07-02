import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Currency } from '../../../../common/enums';
import { GROUP_ERROR_MESSAGES } from '../../../../common/messages';

export class CreateGroupRequestDto {
  @ApiProperty({
    description: 'Tên nhóm chi tiêu.',
    example: 'Trip to Da Nang',
  })
  @IsString({ message: GROUP_ERROR_MESSAGES.GROUP_NAME_REQUIRED })
  @IsNotEmpty({ message: GROUP_ERROR_MESSAGES.GROUP_NAME_REQUIRED })
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Mô tả ngắn về mục đích của nhóm.',
    example: 'Nhóm chi tiêu cho chuyến đi Đà Nẵng',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Đơn vị tiền tệ mặc định của nhóm.',
    enum: Currency,
    default: Currency.VND,
  })
  @IsOptional()
  @IsEnum(Currency, { message: GROUP_ERROR_MESSAGES.GROUP_CURRENCY_INVALID })
  currency?: Currency;
}
