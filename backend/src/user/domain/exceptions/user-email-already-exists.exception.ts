import { DomainException } from '@/common/domain/domain.exception';
import { ErrorCode } from './error-code.enum';

export class UserEmailAlreadyExistsException extends DomainException {
  constructor() {
    super('User with this email already exists');
  }

  getErrorCode(): string {
    return ErrorCode.EMAIL_ALREADY_EXISTS;
  }
}