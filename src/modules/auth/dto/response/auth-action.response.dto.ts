import { ApiProperty } from '@nestjs/swagger';

export class AuthActionResponseDto {
  @ApiProperty({ example: true })
  revoked: true;
}
