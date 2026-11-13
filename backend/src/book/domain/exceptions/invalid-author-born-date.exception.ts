import { DomainException } from "@/common/domain/domain.exception";

import { ErrorCode } from "./error-code.enum";

/** Indicates that an author's date of birth is not a valid date. */
export class InvalidAuthorBornDateException extends DomainException {
  constructor() {
    super("Author born date must be a valid date.");
  }

  getErrorCode(): string {
    return ErrorCode.AUTHOR_BORN_DATE_INVALID;
  }
}
