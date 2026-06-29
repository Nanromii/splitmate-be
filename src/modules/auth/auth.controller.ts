import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentAuthUser, Public } from '../../common/decorators';
import type { CurrentUser } from '../../common/types';
import { AuthService } from './auth.service';
import {
  AuthTokenResponseDto,
  AuthUserResponseDto,
  SessionResponseDto,
} from './dto/auth-response.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
@UseGuards(JwtAuthGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('google/login')
  @ApiOperation({ summary: 'Login with Google ID token' })
  @ApiBody({ type: GoogleLoginDto })
  @ApiOkResponse({ type: AuthTokenResponseDto })
  @ApiUnauthorizedResponse({ description: 'Google token invalid or expired' })
  googleLogin(
    @Body() dto: GoogleLoginDto,
    @Req() request: Request,
  ): Promise<AuthTokenResponseDto> {
    return this.authService.loginWithGoogle(dto, request);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Rotate refresh token and issue new tokens' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiOkResponse({ type: AuthTokenResponseDto })
  @ApiUnauthorizedResponse({
    description: 'Refresh token invalid, expired, revoked, or reused',
  })
  refresh(@Body() dto: RefreshTokenDto): Promise<AuthTokenResponseDto> {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke current session' })
  @ApiOkResponse({ schema: { example: { revoked: true } } })
  logout(
    @CurrentAuthUser() currentUser: CurrentUser,
  ): Promise<{ revoked: true }> {
    return this.authService.logout(currentUser);
  }

  @Post('logout-all')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke all current user sessions' })
  @ApiOkResponse({ schema: { example: { revoked: true } } })
  logoutAll(
    @CurrentAuthUser() currentUser: CurrentUser,
  ): Promise<{ revoked: true }> {
    return this.authService.logoutAll(currentUser);
  }

  @Get('sessions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List current user sessions' })
  @ApiOkResponse({ type: SessionResponseDto, isArray: true })
  sessions(
    @CurrentAuthUser() currentUser: CurrentUser,
  ): Promise<SessionResponseDto[]> {
    return this.authService.listSessions(currentUser);
  }

  @Delete('sessions/:sessionId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke one current user session' })
  @ApiOkResponse({ schema: { example: { revoked: true } } })
  revokeSession(
    @Param('sessionId', new ParseUUIDPipe({ version: '7' })) sessionId: string,
    @CurrentAuthUser() currentUser: CurrentUser,
  ): Promise<{ revoked: true }> {
    return this.authService.revokeOwnedSession(sessionId, currentUser);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiOkResponse({ type: AuthUserResponseDto })
  me(
    @CurrentAuthUser() currentUser: CurrentUser,
  ): Promise<AuthUserResponseDto> {
    return this.authService.getMe(currentUser);
  }
}
