import { DomainException } from "@/common/domain/domain.exception";

import { ErrorCode } from "./error-code.enum";

export class BookMustHaveAuthorException extends DomainException {
  constructor() {
    super("Book must have at least one author");
  }

  getErrorCode(): string {
    return ErrorCode.BOOK_MUST_HAVE_AUTHOR;
  }
}
