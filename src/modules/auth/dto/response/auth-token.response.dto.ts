import { ApiProperty } from '@nestjs/swagger';
import { AuthUserResponseDto } from './auth-user.response.dto';

export class AuthTokenResponseDto {
  @ApiProperty({ type: AuthUserResponseDto })
  user: AuthUserResponseDto;

  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  sessionId: string;

  @ApiProperty({
    description: 'Thời hạn access token, tính bằng giây.',
    example: 900,
  })
  expiresIn: number;
}
