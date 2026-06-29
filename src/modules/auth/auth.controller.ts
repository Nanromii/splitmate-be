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
  AuthActionResponseDto,
  AuthSessionResponseDto,
  AuthUserResponseDto,
  GoogleLoginResponseDto,
  RefreshTokenResponseDto,
} from './dto/response';
import { GoogleLoginRequestDto, RefreshTokenRequestDto } from './dto/request';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller('auth')
@UseGuards(JwtAuthGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('google/login')
  @ApiOperation({ summary: 'Đăng nhập bằng Google ID token' })
  @ApiBody({ type: GoogleLoginRequestDto })
  @ApiOkResponse({ type: GoogleLoginResponseDto })
  @ApiUnauthorizedResponse({
    description: 'Google ID token không hợp lệ hoặc đã hết hạn.',
  })
  googleLogin(
    @Body() dto: GoogleLoginRequestDto,
    @Req() request: Request,
  ): Promise<GoogleLoginResponseDto> {
    return this.authService.loginWithGoogle(dto, request);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Làm mới và rotate refresh token' })
  @ApiBody({ type: RefreshTokenRequestDto })
  @ApiOkResponse({ type: RefreshTokenResponseDto })
  @ApiUnauthorizedResponse({
    description:
      'Refresh token không hợp lệ, đã hết hạn, đã bị thu hồi hoặc bị dùng lại.',
  })
  refresh(
    @Body() dto: RefreshTokenRequestDto,
  ): Promise<RefreshTokenResponseDto> {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Thu hồi session hiện tại' })
  @ApiOkResponse({ type: AuthActionResponseDto })
  logout(
    @CurrentAuthUser() currentUser: CurrentUser,
  ): Promise<AuthActionResponseDto> {
    return this.authService.logout(currentUser);
  }

  @Post('logout-all')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Thu hồi toàn bộ session của người dùng hiện tại' })
  @ApiOkResponse({ type: AuthActionResponseDto })
  logoutAll(
    @CurrentAuthUser() currentUser: CurrentUser,
  ): Promise<AuthActionResponseDto> {
    return this.authService.logoutAll(currentUser);
  }

  @Get('sessions')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy danh sách session của người dùng hiện tại' })
  @ApiOkResponse({ type: AuthSessionResponseDto, isArray: true })
  sessions(
    @CurrentAuthUser() currentUser: CurrentUser,
  ): Promise<AuthSessionResponseDto[]> {
    return this.authService.listSessions(currentUser);
  }

  @Delete('sessions/:sessionId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Thu hồi một session thuộc người dùng hiện tại' })
  @ApiOkResponse({ type: AuthActionResponseDto })
  revokeSession(
    @Param('sessionId', new ParseUUIDPipe({ version: '7' })) sessionId: string,
    @CurrentAuthUser() currentUser: CurrentUser,
  ): Promise<AuthActionResponseDto> {
    return this.authService.revokeOwnedSession(sessionId, currentUser);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lấy thông tin người dùng đang đăng nhập' })
  @ApiOkResponse({ type: AuthUserResponseDto })
  me(
    @CurrentAuthUser() currentUser: CurrentUser,
  ): Promise<AuthUserResponseDto> {
    return this.authService.getMe(currentUser);
  }
}
