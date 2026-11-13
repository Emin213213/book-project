import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';

interface HttpExceptionWithErrorCode extends HttpException {
  getErrorCode(): string;
}

function hasErrorCode(exception: HttpException): exception is HttpExceptionWithErrorCode {
  return 'getErrorCode' in exception && typeof exception.getErrorCode === 'function';
}

@Catch(HttpException)
export class HttpErrorCodeExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();

    if (hasErrorCode(exception)) {
      response.status(status).json({
        statusCode: status,
        errorCode: exception.getErrorCode(),
        message: exception.message,
      });
      return;
    }

    response.status(status).json(exception.getResponse());
  }
}