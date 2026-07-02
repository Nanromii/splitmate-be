import { ApiProperty } from '@nestjs/swagger';

export class ExpenseActionResponseDto {
  @ApiProperty()
  message: string;
}
