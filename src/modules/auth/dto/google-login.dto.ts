import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class GoogleLoginDto {
  @ApiProperty({
    description: 'Google ID token issued for the configured Google client id',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6Ij...',
  })
  @IsString()
  @IsNotEmpty()
  idToken: string;

  @ApiPropertyOptional({
    description: 'Client-provided device id',
    example: 'web-chrome-profile-1',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  deviceId?: string;

  @ApiPropertyOptional({
    description: 'Human-readable device name',
    example: 'Chrome on Windows',
  })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  deviceName?: string;
}
