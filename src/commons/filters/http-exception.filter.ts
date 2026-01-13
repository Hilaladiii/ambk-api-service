import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as any;

    if (exception instanceof ThrottlerException) {
      return response.status(status).json({
        statusCode: status,
        message: 'Too many request, try again later!',
        error: 'Too many request',
      });
    }

    let message = exceptionResponse.message;

    if (Array.isArray(message) && message.length === 1) message = message[0];

    response.status(status).json({
      statusCode: status,
      message: message,
      error: exceptionResponse.error || exception.name,
    });
  }
}
