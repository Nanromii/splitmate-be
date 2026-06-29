import { UserRole } from '../enums';

export type JwtPayload = {
  sub: string;

  sessionId: string;

  email: string;

  role: UserRole;

  tokenVersion: number;
};
