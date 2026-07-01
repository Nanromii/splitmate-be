jest.mock('uuid', () => ({
  v7: jest.fn(() => '01980000-0000-7000-8000-000000000010'),
}));

import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import {
  RevokeReason,
  SessionStatus,
  UserRole,
  UserStatus,
} from '../../common/enums';
import { AUTH_ERROR_MESSAGES } from '../../common/messages';
import { AuthService } from './auth.service';
import { GoogleTokenService } from './google-token.service';
import { SessionRepository, UserRepository } from '../repositories';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: {
    findByGoogleProviderAccountIdOrEmail: jest.Mock;
    findById: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let sessionRepository: {
    create: jest.Mock;
    save: jest.Mock;
    findByIdWithUserAndRefreshTokenHash: jest.Mock;
    findByIdWithUser: jest.Mock;
    findByIdAndUserId: jest.Mock;
    revokeAllActiveByUserId: jest.Mock;
  };
  let jwtService: {
    signAsync: jest.Mock;
    verifyAsync: jest.Mock;
  };
  let googleTokenService: {
    verifyIdToken: jest.Mock;
  };
  let savedSession: SessionRecord | undefined;

  const user = {
    id: '01980000-0000-7000-8000-000000000001',
    email: 'user@example.com',
    displayName: 'Split Mate',
    avatarUrl: 'https://example.com/avatar.png',
    provider: 'google',
    providerAccountId: 'google-sub',
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    tokenVersion: 0,
    emailVerifiedAt: new Date(),
    lastLoginAt: new Date(),
  };

  type UserRecord = typeof user;

  const makeSession = async (refreshToken = 'refresh-token') => ({
    id: '01980000-0000-7000-8000-000000000002',
    userId: user.id,
    user,
    refreshTokenHash: await bcrypt.hash(refreshToken, 1),
    tokenFamily: '01980000-0000-7000-8000-000000000003',
    status: SessionStatus.ACTIVE,
    lastActivityAt: new Date(),
    expiresAt: new Date(Date.now() + 60_000),
    revokedAt: null,
    revokeReason: null,
    createdAt: new Date(),
    deviceId: null,
    deviceName: null,
    userAgent: null,
    ipAddress: null,
  });

  type SessionRecord = Awaited<ReturnType<typeof makeSession>>;

  beforeEach(async () => {
    userRepository = {
      findByGoogleProviderAccountIdOrEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn((value: Partial<UserRecord>) => ({ ...user, ...value })),
      save: jest.fn((value: UserRecord) => Promise.resolve(value)),
    };
    savedSession = undefined;
    sessionRepository = {
      create: jest.fn((value: SessionRecord) => value),
      save: jest.fn((value: SessionRecord) => {
        savedSession = value;
        return Promise.resolve(value);
      }),
      findByIdWithUserAndRefreshTokenHash: jest.fn(),
      findByIdWithUser: jest.fn(),
      findByIdAndUserId: jest.fn(),
      revokeAllActiveByUserId: jest.fn(),
    };
    jwtService = {
      signAsync: jest.fn(),
      verifyAsync: jest.fn(),
    };
    googleTokenService = {
      verifyIdToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserRepository,
          useValue: userRepository,
        },
        {
          provide: SessionRepository,
          useValue: sessionRepository,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn((key: string) => {
              const values: Record<string, string> = {
                'auth.jwt.accessSecret': 'access-secret',
                'auth.jwt.accessExpiresIn': '15m',
                'auth.jwt.refreshSecret': 'refresh-secret',
                'auth.jwt.refreshExpiresIn': '30d',
                'auth.google.clientId': 'google-client-id',
              };

              return values[key];
            }),
          },
        },
        {
          provide: GoogleTokenService,
          useValue: googleTokenService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a Google user, session, and token pair', async () => {
    userRepository.findByGoogleProviderAccountIdOrEmail.mockResolvedValue(null);
    googleTokenService.verifyIdToken.mockResolvedValue({
      providerAccountId: 'google-sub',
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
    });
    jwtService.signAsync
      .mockResolvedValueOnce('access-token')
      .mockResolvedValueOnce('refresh-token');

    const result = await service.loginWithGoogle(
      {
        idToken: 'google-id-token',
        deviceName: 'Chrome on Windows',
      },
      {
        headers: {
          'user-agent': 'jest',
        },
        ip: '127.0.0.1',
      } as Request,
    );

    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toBe('refresh-token');
    expect(result.user.email).toBe(user.email);
    expect(userRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: user.email,
        passwordHash: null,
        provider: 'google',
        providerAccountId: 'google-sub',
        status: UserStatus.ACTIVE,
      }),
    );
    expect(sessionRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: user.id,
        status: SessionStatus.ACTIVE,
        deviceName: 'Chrome on Windows',
      }),
    );

    expect(savedSession).toBeDefined();
    await expect(
      bcrypt.compare('refresh-token', savedSession!.refreshTokenHash),
    ).resolves.toBe(true);
  });

  it('should reject a suspended Google user without creating a session', async () => {
    userRepository.findByGoogleProviderAccountIdOrEmail.mockResolvedValue({
      ...user,
      status: UserStatus.SUSPENDED,
    });
    googleTokenService.verifyIdToken.mockResolvedValue({
      providerAccountId: 'google-sub',
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
    });

    await expect(
      service.loginWithGoogle(
        {
          idToken: 'google-id-token',
        },
        {
          headers: {},
          ip: '127.0.0.1',
        } as unknown as Request,
      ),
    ).rejects.toThrow(AUTH_ERROR_MESSAGES.USER_INACTIVE);

    expect(sessionRepository.save).not.toHaveBeenCalled();
  });

  it('should rotate refresh tokens', async () => {
    const session = await makeSession('old-refresh-token');
    sessionRepository.findByIdWithUserAndRefreshTokenHash.mockResolvedValue(
      session,
    );
    jwtService.verifyAsync.mockResolvedValue({
      sub: user.id,
      sessionId: session.id,
      email: user.email,
      role: UserRole.USER,
      tokenVersion: 0,
      type: 'refresh',
    });
    jwtService.signAsync
      .mockResolvedValueOnce('new-access-token')
      .mockResolvedValueOnce('new-refresh-token');

    const result = await service.refresh('old-refresh-token');

    expect(result.refreshToken).toBe('new-refresh-token');
    expect(sessionRepository.save).toHaveBeenCalledWith(session);
    await expect(
      bcrypt.compare('new-refresh-token', session.refreshTokenHash),
    ).resolves.toBe(true);
    await expect(
      bcrypt.compare('old-refresh-token', session.refreshTokenHash),
    ).resolves.toBe(false);
  });

  it('should revoke the session when an old refresh token is reused', async () => {
    const session = await makeSession('new-refresh-token');
    sessionRepository.findByIdWithUserAndRefreshTokenHash.mockResolvedValue(
      session,
    );
    jwtService.verifyAsync.mockResolvedValue({
      sub: user.id,
      sessionId: session.id,
      email: user.email,
      role: UserRole.USER,
      tokenVersion: 0,
      type: 'refresh',
    });

    await expect(service.refresh('old-refresh-token')).rejects.toThrow(
      AUTH_ERROR_MESSAGES.REFRESH_TOKEN_INVALID,
    );

    expect(session.status).toBe(SessionStatus.REVOKED);
    expect(session.revokeReason).toBe(RevokeReason.REUSE_DETECTED);
  });

  it('should revoke the current session on logout', async () => {
    const session = await makeSession();
    sessionRepository.findByIdAndUserId.mockResolvedValue(session);

    await expect(
      service.logout({
        id: user.id,
        email: user.email,
        role: UserRole.USER,
        sessionId: session.id,
      }),
    ).resolves.toEqual({ revoked: true });

    expect(session.status).toBe(SessionStatus.REVOKED);
    expect(session.revokeReason).toBe(RevokeReason.LOGOUT);
  });

  it('should revoke all active sessions for the current user', async () => {
    sessionRepository.revokeAllActiveByUserId.mockResolvedValue(undefined);

    await expect(
      service.logoutAll({
        id: user.id,
        email: user.email,
        role: UserRole.USER,
        sessionId: '01980000-0000-7000-8000-000000000002',
      }),
    ).resolves.toEqual({ revoked: true });

    expect(sessionRepository.revokeAllActiveByUserId).toHaveBeenCalledWith(
      user.id,
    );
  });

  it('should block revoking a session that does not belong to the user', async () => {
    sessionRepository.findByIdAndUserId.mockResolvedValue(null);

    await expect(
      service.revokeOwnedSession('01980000-0000-7000-8000-000000000099', {
        id: user.id,
        email: user.email,
        role: UserRole.USER,
        sessionId: '01980000-0000-7000-8000-000000000002',
      }),
    ).rejects.toThrow(AUTH_ERROR_MESSAGES.SESSION_NOT_FOUND);
  });

  it('should reject invalid access tokens', async () => {
    jwtService.verifyAsync.mockRejectedValue(new Error('bad token'));

    await expect(service.validateAccessToken('bad-token')).rejects.toThrow(
      AUTH_ERROR_MESSAGES.ACCESS_TOKEN_INVALID,
    );
  });
});
