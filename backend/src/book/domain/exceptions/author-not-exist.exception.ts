import { DomainException } from "@/common/domain/domain.exception";

import { ErrorCode } from "./error-code.enum";

export class AuthorNotExistException extends DomainException {
  constructor(ids: string[]) {
    super(`Authors not found: ${ids.join(", ")}`);
  }

  getErrorCode(): string {
    return ErrorCode.AUTHOR_NOT_EXIST;
  }
}
