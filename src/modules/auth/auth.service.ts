import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { Request } from 'express';
import {
  AuthProvider,
  RevokeReason,
  SessionStatus,
  UserStatus,
} from '../../common/enums';
import {
  CurrentUser,
  JwtPayload,
  RefreshTokenPayload,
} from '../../common/types';
import { generateUuid } from '../../common/utils/uuid.util';
import { Session, User } from '../../database';
import { SessionRepository, UserRepository } from '../repositories';
import {
  mapAuthTokenResponse,
  mapSessionToAuthSessionResponse,
  mapUserToAuthUserResponse,
} from './auth.mapper';
import {
  AuthActionResponseDto,
  AuthSessionResponseDto,
  AuthTokenResponseDto,
  AuthUserResponseDto,
} from './dto/response';
import { GoogleLoginRequestDto } from './dto/request';
import { GoogleTokenService } from './google-token.service';
import { AUTH_ERROR_MESSAGES } from './messages';
import { AuthTokenPair, GoogleUserProfile, RequestMetadata } from './types';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly googleTokenService: GoogleTokenService,
  ) {}

  async loginWithGoogle(
    dto: GoogleLoginRequestDto,
    request: Request,
  ): Promise<AuthTokenResponseDto> {
    const profile = await this.googleTokenService.verifyIdToken(dto.idToken);
    const user = await this.findOrCreateGoogleUser(profile);

    this.assertUserCanAuthenticate(user);

    const sessionId = generateUuid();
    const now = new Date();
    const refreshExpiresIn = this.getRefreshTokenExpiresIn();
    const expiresAt = new Date(
      now.getTime() + this.parseDurationToMilliseconds(refreshExpiresIn),
    );
    const tokens = await this.generateTokenPair(user, sessionId);
    const metadata = this.getRequestMetadata(request);

    const session = this.sessionRepository.create({
      id: sessionId,
      userId: user.id,
      refreshTokenHash: await bcrypt.hash(tokens.refreshToken, 12),
      tokenFamily: generateUuid(),
      status: SessionStatus.ACTIVE,
      deviceId: dto.deviceId ?? null,
      deviceName: dto.deviceName ?? null,
      userAgent: metadata.userAgent ?? null,
      ipAddress: metadata.ipAddress ?? null,
      lastActivityAt: now,
      expiresAt,
      revokedAt: null,
    });

    await this.sessionRepository.save(session);

    return this.buildAuthResponse(user, sessionId, tokens);
  }

  async refresh(refreshToken: string): Promise<AuthTokenResponseDto> {
    const payload = await this.verifyRefreshToken(refreshToken);
    const session = await this.findSessionWithUserAndRefreshHash(
      payload.sessionId,
    );

    this.assertSessionCanRefresh(session);
    this.assertUserCanAuthenticate(session.user);

    const tokenMatches = await bcrypt.compare(
      refreshToken,
      session.refreshTokenHash,
    );

    if (!tokenMatches) {
      await this.revokeSession(session, RevokeReason.REUSE_DETECTED);
      throw new UnauthorizedException(
        AUTH_ERROR_MESSAGES.REFRESH_TOKEN_INVALID,
      );
    }

    const tokens = await this.generateTokenPair(session.user, session.id);
    session.refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 12);
    session.lastActivityAt = new Date();

    await this.sessionRepository.save(session);

    return this.buildAuthResponse(session.user, session.id, tokens);
  }

  async logout(currentUser: CurrentUser): Promise<AuthActionResponseDto> {
    const session = await this.findOwnedSession(
      currentUser.sessionId,
      currentUser.id,
    );

    await this.revokeSession(session, RevokeReason.LOGOUT);

    return { revoked: true };
  }

  async logoutAll(currentUser: CurrentUser): Promise<AuthActionResponseDto> {
    await this.sessionRepository
      .createQueryBuilder()
      .update(Session)
      .set({
        status: SessionStatus.REVOKED,
        revokedAt: new Date(),
        revokeReason: RevokeReason.LOGOUT_ALL,
      })
      .where('user_id = :userId', { userId: currentUser.id })
      .andWhere('status = :status', { status: SessionStatus.ACTIVE })
      .andWhere('revoked_at IS NULL')
      .execute();

    return { revoked: true };
  }

  async listSessions(
    currentUser: CurrentUser,
  ): Promise<AuthSessionResponseDto[]> {
    const sessions = await this.sessionRepository.find({
      where: {
        userId: currentUser.id,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return sessions.map((session) => mapSessionToAuthSessionResponse(session));
  }

  async revokeOwnedSession(
    sessionId: string,
    currentUser: CurrentUser,
  ): Promise<AuthActionResponseDto> {
    const session = await this.findOwnedSession(sessionId, currentUser.id);

    await this.revokeSession(session, RevokeReason.LOGOUT);

    return { revoked: true };
  }

  async getMe(currentUser: CurrentUser): Promise<AuthUserResponseDto> {
    const user = await this.userRepository.findOne({
      where: {
        id: currentUser.id,
      },
    });

    if (!user) {
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.USER_NOT_FOUND);
    }

    this.assertUserCanAuthenticate(user);

    return this.serializeUser(user);
  }

  async validateAccessToken(token: string): Promise<CurrentUser> {
    const payload = await this.verifyAccessToken(token);
    const session = await this.findSessionWithUser(payload.sessionId);

    this.assertSessionCanUseAccessToken(session);
    this.assertUserCanAuthenticate(session.user);

    if (session.user.id !== payload.sub) {
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.ACCESS_TOKEN_INVALID);
    }

    if (session.user.tokenVersion !== payload.tokenVersion) {
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.ACCESS_TOKEN_INVALID);
    }

    return {
      id: session.user.id,
      email: session.user.email,
      role: session.user.role,
      sessionId: session.id,
    };
  }

  private async findOrCreateGoogleUser(
    profile: GoogleUserProfile,
  ): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: [
        {
          provider: AuthProvider.GOOGLE,
          providerAccountId: profile.providerAccountId,
        },
        {
          email: profile.email,
        },
      ],
    });

    if (!existingUser) {
      const user = this.userRepository.create({
        email: profile.email,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl ?? null,
        passwordHash: null,
        provider: AuthProvider.GOOGLE,
        providerAccountId: profile.providerAccountId,
        emailVerifiedAt: new Date(),
        status: UserStatus.ACTIVE,
        lastLoginAt: new Date(),
      });

      return this.userRepository.save(user);
    }

    if (
      existingUser.status === UserStatus.INACTIVE ||
      existingUser.status === UserStatus.SUSPENDED
    ) {
      return existingUser;
    }

    existingUser.displayName = profile.displayName;
    existingUser.avatarUrl =
      profile.avatarUrl ?? existingUser.avatarUrl ?? null;
    existingUser.provider = AuthProvider.GOOGLE;
    existingUser.providerAccountId = profile.providerAccountId;
    existingUser.emailVerifiedAt = existingUser.emailVerifiedAt ?? new Date();
    existingUser.lastLoginAt = new Date();

    if (existingUser.status === UserStatus.PENDING_VERIFICATION) {
      existingUser.status = UserStatus.ACTIVE;
    }

    return this.userRepository.save(existingUser);
  }

  private async generateTokenPair(
    user: User,
    sessionId: string,
  ): Promise<AuthTokenPair> {
    const accessExpiresIn = this.getAccessTokenExpiresIn();
    const refreshExpiresIn = this.getRefreshTokenExpiresIn();
    const basePayload: JwtPayload = {
      sub: user.id,
      sessionId,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    };

    const refreshPayload: RefreshTokenPayload = {
      ...basePayload,
      type: 'refresh',
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(basePayload, {
        secret: this.configService.getOrThrow<string>('auth.jwt.accessSecret'),
        expiresIn: this.parseDurationToSeconds(accessExpiresIn),
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.configService.getOrThrow<string>('auth.jwt.refreshSecret'),
        expiresIn: this.parseDurationToSeconds(refreshExpiresIn),
      }),
    ]);

    return {
      accessToken,
      refreshToken,
      expiresIn: this.parseDurationToSeconds(accessExpiresIn),
    };
  }

  private async verifyAccessToken(token: string): Promise<JwtPayload> {
    try {
      return await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.getOrThrow<string>('auth.jwt.accessSecret'),
      });
    } catch {
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.ACCESS_TOKEN_INVALID);
    }
  }

  private async verifyRefreshToken(
    refreshToken: string,
  ): Promise<RefreshTokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(
        refreshToken,
        {
          secret: this.configService.getOrThrow<string>(
            'auth.jwt.refreshSecret',
          ),
        },
      );

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException(
          AUTH_ERROR_MESSAGES.REFRESH_TOKEN_INVALID,
        );
      }

      return payload;
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        this.isTokenExpiredError(error)
      ) {
        throw new UnauthorizedException(
          this.isTokenExpiredError(error)
            ? AUTH_ERROR_MESSAGES.REFRESH_TOKEN_EXPIRED
            : AUTH_ERROR_MESSAGES.REFRESH_TOKEN_INVALID,
        );
      }

      throw new UnauthorizedException(
        AUTH_ERROR_MESSAGES.REFRESH_TOKEN_INVALID,
      );
    }
  }

  private async findSessionWithUserAndRefreshHash(
    sessionId: string,
  ): Promise<Session> {
    const session = await this.sessionRepository
      .createQueryBuilder('session')
      .addSelect('session.refreshTokenHash')
      .leftJoinAndSelect('session.user', 'user')
      .where('session.id = :sessionId', { sessionId })
      .getOne();

    if (!session) {
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.SESSION_NOT_FOUND);
    }

    return session;
  }

  private async findSessionWithUser(sessionId: string): Promise<Session> {
    const session = await this.sessionRepository.findOne({
      where: {
        id: sessionId,
      },
      relations: {
        user: true,
      },
    });

    if (!session) {
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.SESSION_NOT_FOUND);
    }

    return session;
  }

  private async findOwnedSession(
    sessionId: string,
    userId: string,
  ): Promise<Session> {
    const session = await this.sessionRepository.findOne({
      where: {
        id: sessionId,
        userId,
      },
    });

    if (!session) {
      throw new NotFoundException(AUTH_ERROR_MESSAGES.SESSION_NOT_FOUND);
    }

    return session;
  }

  private assertSessionCanRefresh(session: Session): void {
    if (session.status !== SessionStatus.ACTIVE || session.revokedAt) {
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.SESSION_REVOKED);
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.SESSION_EXPIRED);
    }
  }

  private assertSessionCanUseAccessToken(session: Session): void {
    if (session.status !== SessionStatus.ACTIVE || session.revokedAt) {
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.SESSION_REVOKED);
    }

    if (session.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.SESSION_EXPIRED);
    }
  }

  private assertUserCanAuthenticate(user: User): void {
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException(AUTH_ERROR_MESSAGES.USER_INACTIVE);
    }
  }

  private async revokeSession(
    session: Session,
    reason: RevokeReason,
  ): Promise<void> {
    if (session.revokedAt) {
      return;
    }

    session.status = SessionStatus.REVOKED;
    session.revokedAt = new Date();
    session.revokeReason = reason;

    await this.sessionRepository.save(session);
  }

  private buildAuthResponse(
    user: User,
    sessionId: string,
    tokens: AuthTokenPair,
  ): AuthTokenResponseDto {
    return mapAuthTokenResponse(user, sessionId, tokens);
  }

  private serializeUser(user: User): AuthUserResponseDto {
    return mapUserToAuthUserResponse(user);
  }

  private getRequestMetadata(request: Request): RequestMetadata {
    return {
      userAgent: request.headers['user-agent'],
      ipAddress: request.ip,
    };
  }

  private getAccessTokenExpiresIn(): string {
    return this.configService.getOrThrow<string>('auth.jwt.accessExpiresIn');
  }

  private getRefreshTokenExpiresIn(): string {
    return this.configService.getOrThrow<string>('auth.jwt.refreshExpiresIn');
  }

  private parseDurationToSeconds(value: string): number {
    return Math.floor(this.parseDurationToMilliseconds(value) / 1000);
  }

  private parseDurationToMilliseconds(value: string): number {
    const match = /^(\d+)([smhd])?$/.exec(value);

    if (!match) {
      throw new Error(AUTH_ERROR_MESSAGES.UNSUPPORTED_TOKEN_DURATION);
    }

    const amount = Number(match[1]);
    const unit = match[2] ?? 's';

    switch (unit) {
      case 's':
        return amount * 1000;
      case 'm':
        return amount * 60 * 1000;
      case 'h':
        return amount * 60 * 60 * 1000;
      case 'd':
        return amount * 24 * 60 * 60 * 1000;
      default:
        throw new Error(AUTH_ERROR_MESSAGES.UNSUPPORTED_TOKEN_DURATION_UNIT);
    }
  }

  private isTokenExpiredError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'name' in error &&
      error.name === 'TokenExpiredError'
    );
  }
}
