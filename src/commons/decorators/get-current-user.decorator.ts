import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtClaims } from '../types/jwt.type';

export const GetCurrentUser = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtClaims;

    return !data ? user : user[data];
  },
);
