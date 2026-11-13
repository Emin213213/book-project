import { HttpException } from '@nestjs/common';
import { ErrorCode } from '../../infrastructure/http/error-code.enum';

export class UnauthenticatedException extends HttpException {
  private readonly errorCode: string;

  constructor(
    message: string = 'Authentication required',
    errorCode: string = ErrorCode.UNAUTHENTICATED,
  ) {
    super(message, 401);
    this.errorCode = errorCode;
  }

  getErrorCode(): string {
    return this.errorCode;
  }
}
