import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  AuthProvider,
  SessionStatus,
  UserRole,
  UserStatus,
} from '../../../common/enums';

export class AuthUserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  displayName: string;

  @ApiPropertyOptional()
  avatarUrl?: string | null;

  @ApiProperty({ enum: AuthProvider })
  provider: AuthProvider;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty({ enum: UserStatus })
  status: UserStatus;
}

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
    description: 'Access token lifetime in seconds',
    example: 900,
  })
  expiresIn: number;
}

export class SessionResponseDto {
  @ApiProperty()
  sessionId: string;

  @ApiPropertyOptional()
  deviceId?: string | null;

  @ApiPropertyOptional()
  deviceName?: string | null;

  @ApiPropertyOptional()
  userAgent?: string | null;

  @ApiPropertyOptional()
  ipAddress?: string | null;

  @ApiProperty({ enum: SessionStatus })
  status: SessionStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  lastUsedAt: Date;

  @ApiProperty()
  expiresAt: Date;

  @ApiPropertyOptional()
  revokedAt?: Date | null;
}
