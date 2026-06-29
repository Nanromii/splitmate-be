import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class GoogleLoginRequestDto {
  @ApiProperty({
    description: 'Google ID token được cấp cho `GOOGLE_CLIENT_ID` đã cấu hình.',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...',
  })
  @IsString()
  @IsNotEmpty()
  idToken: string;

  @ApiPropertyOptional({
    description: 'Mã định danh thiết bị do client cung cấp.',
    example: 'web-chrome-profile-1',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  deviceId?: string;

  @ApiPropertyOptional({
    description: 'Tên thiết bị hiển thị cho người dùng.',
    example: 'Chrome on Windows',
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  deviceName?: string;
}
