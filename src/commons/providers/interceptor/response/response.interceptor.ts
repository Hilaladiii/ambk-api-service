import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map, Observable } from 'rxjs';
import { CUSTOM_MESSAGE_META_KEY } from 'src/commons/decorators/message.decorator';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> | Promise<Observable<any>> {
    const message = this.reflector.get(
      CUSTOM_MESSAGE_META_KEY,
      context.getHandler(),
    );

    return next.handle().pipe(
      map((data) => {
        return {
          statusCode: context.switchToHttp().getResponse().statusCode,
          message,
          data,
        };
      }),
    );
  }
}
