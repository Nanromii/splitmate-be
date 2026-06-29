import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { CurrentUser } from '../types';

type RequestWithUser = Request & {
  user?: CurrentUser;
};

export const CurrentAuthUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentUser | undefined => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user;
  },
);
