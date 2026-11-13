import { HttpException } from '@nestjs/common';
import { ErrorCode } from '../../infrastructure/http/error-code.enum';

export class AccessDeniedException extends HttpException {
  private readonly errorCode: string;

  constructor(
    message: string = 'Access denied',
    errorCode: string = ErrorCode.ACCESS_DENIED,
  ) {
    super(message, 403);
    this.errorCode = errorCode;
  }

  getErrorCode(): string {
    return this.errorCode;
  }
}
