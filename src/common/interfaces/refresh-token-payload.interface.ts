import { JwtPayload } from './jwt-payload.interface';

export interface RefreshTokenPayload extends JwtPayload {
  type: 'refresh';
}