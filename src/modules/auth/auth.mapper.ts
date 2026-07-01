import { Session, User } from '../../database';
import { AuthTokenPair } from '../../common/types';
import {
  AuthSessionResponseDto,
  AuthTokenResponseDto,
  AuthUserResponseDto,
} from './dto/response';

export const mapUserToAuthUserResponse = (user: User): AuthUserResponseDto => ({
  id: user.id,
  email: user.email,
  displayName: user.displayName,
  avatarUrl: user.avatarUrl ?? null,
  provider: user.provider,
  role: user.role,
  status: user.status,
});

export const mapSessionToAuthSessionResponse = (
  session: Session,
): AuthSessionResponseDto => ({
  sessionId: session.id,
  deviceId: session.deviceId ?? null,
  deviceName: session.deviceName ?? null,
  userAgent: session.userAgent ?? null,
  ipAddress: session.ipAddress ?? null,
  status: session.status,
  createdAt: session.createdAt,
  lastUsedAt: session.lastActivityAt,
  expiresAt: session.expiresAt,
  revokedAt: session.revokedAt ?? null,
});

export const mapAuthTokenResponse = (
  user: User,
  sessionId: string,
  tokens: AuthTokenPair,
): AuthTokenResponseDto => ({
  user: mapUserToAuthUserResponse(user),
  accessToken: tokens.accessToken,
  refreshToken: tokens.refreshToken,
  sessionId,
  expiresIn: tokens.expiresIn,
});
