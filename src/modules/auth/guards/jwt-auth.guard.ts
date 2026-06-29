import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../../../common/decorators';
import { CurrentUser } from '../../../common/types';
import { AuthService } from '../auth.service';

type RequestWithUser = Request & {
  user?: CurrentUser;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractBearerToken(request);

    request.user = await this.authService.validateAccessToken(token);

    return true;
  }

  private extractBearerToken(request: Request): string {
    const authorization = request.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const [scheme, token] = authorization.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid bearer token');
    }

    return token;
  }
}
