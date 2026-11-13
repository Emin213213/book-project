import { DomainException } from '@/common/domain/domain.exception';
import { ErrorCode } from '@/user/domain/exceptions/error-code.enum';

/** Сообщает о конфликте уникального slug роли. */
export class RoleExistException extends DomainException {
  constructor(options?: ErrorOptions) {
    super('Role already exists');
    if (options) {
      this.cause = options.cause;
    }
  }

  public getErrorCode(): string {
    return ErrorCode.ROLE_ALREADY_EXIST;
  }
}
