import { UserRole } from '../enums';

export interface JwtPayload {
  sub: string;

  sessionId: string;

  email: string;

  role: UserRole;

  tokenVersion: number;
}
