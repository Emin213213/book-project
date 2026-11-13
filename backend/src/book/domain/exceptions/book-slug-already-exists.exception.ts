import { DomainException } from "@/common/domain/domain.exception";

import { ErrorCode } from "./error-code.enum";

export class BookSlugAlreadyExistsException extends DomainException {
  constructor() {
    super("Book with this slug already exists");
  }

  getErrorCode(): string {
    return ErrorCode.BOOK_SLUG_ALREADY_EXISTS;
  }
}
