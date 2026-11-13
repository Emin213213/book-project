import { HttpException } from '@nestjs/common';
import { ErrorCode } from '../../infrastructure/http/error-code.enum';

export class ResourceNotExistsException extends HttpException {
  private readonly errorCode: string;

  constructor(
    message: string,
    errorCode: string = ErrorCode.RESOURCE_NOT_FOUND,
  ) {
    super(message, 404);
    this.errorCode = errorCode;
  }

  getErrorCode(): string {
    return this.errorCode;
  }
}