import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CurrentUser, RequestWithUser } from '../types';

export const CurrentAuthUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentUser | undefined => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user;
  },
);
