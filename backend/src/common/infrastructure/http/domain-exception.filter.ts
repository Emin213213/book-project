import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { DomainException } from '../../domain/domain.exception';

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const statusCode: number = exception.statusCode;
    const errorCode: string = exception.getErrorCode();
    const message: string = exception.message;

    response.status(statusCode).json({
      statusCode,
      errorCode,
      message,
    });
  }
}
