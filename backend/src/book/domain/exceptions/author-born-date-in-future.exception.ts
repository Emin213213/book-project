import { DomainException } from "@/common/domain/domain.exception";

import { ErrorCode } from "./error-code.enum";

/** Indicates that an author's date of birth is in the future. */
export class AuthorBornDateInFutureException extends DomainException {
  constructor() {
    super("Author born date must not be in the future.");
  }

  getErrorCode(): string {
    return ErrorCode.AUTHOR_BORN_DATE_IN_FUTURE;
  }
}
