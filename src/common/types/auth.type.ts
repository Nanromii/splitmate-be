import { Request } from 'express';
import { UserRole } from '../enums';

export type CurrentUser = {
  id: string;
  email: string;
  role: UserRole;
  sessionId: string;
};

export type JwtPayload = {
  sub: string;
  sessionId: string;
  email: string;
  role: UserRole;
  tokenVersion: number;
};

export type RefreshTokenPayload = JwtPayload & {
  type: 'refresh';
};

export type RequestWithUser = Request & {
  user?: CurrentUser;
};

export type AuthTokenPair = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
};

export type RequestMetadata = {
  userAgent?: string;
  ipAddress?: string;
};
