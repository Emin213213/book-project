import { DomainException } from '@/common/domain/domain.exception';
import { ErrorCode } from './error-code.enum';

export class RoleNotFoundException extends DomainException {
  constructor(slug: string) {
    super(`Role '${slug}' not found`);
  }

  getErrorCode(): string {
    return ErrorCode.ROLE_NOT_FOUND;
  }
}
