import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    if (response.headersSent) {
      return response.end();
    }
    response.status(status).json({
      statusCode: status,
      isSucess: false,
      data: null,
      error:
        exception instanceof HttpException
          ? typeof exception.getResponse() === 'object'
            ? {
                code:
                  (exception.getResponse() as any).error ?? `HTTP_${status}`,
                message: (exception.getResponse() as any).message,
              }
            : {
                code: `HTTP_${status}`,
                message: exception.getResponse(),
              }
          : {
              code:
                exception instanceof Error ? exception.name : 'UNKNOWN_ERROR',
              message:
                exception instanceof Error
                  ? exception.message
                  : 'Internal server error',
            },
    });
  }
}
