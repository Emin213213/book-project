import { DomainException } from '@/common/domain/domain.exception';
import { ErrorCode } from './error-code.enum';

export class UserNotFoundException extends DomainException {
  constructor() {
    super('User not found');
  }

  getErrorCode(): string {
    return ErrorCode.NOT_FOUND;
  }
}
