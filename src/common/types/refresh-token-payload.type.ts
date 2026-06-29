import { JwtPayload } from './jwt-payload.type';

export type RefreshTokenPayload = JwtPayload & {
  type: 'refresh';
};
