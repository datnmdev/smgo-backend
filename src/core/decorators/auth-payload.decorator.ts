import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const AuthPayload = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const payload = request.user;
    return data ? payload?.[data] : payload;
  },
);
