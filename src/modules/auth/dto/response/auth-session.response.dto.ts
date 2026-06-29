import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SessionStatus } from '../../../../common/enums';

export class AuthSessionResponseDto {
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
