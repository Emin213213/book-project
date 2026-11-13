import { DomainException } from "@/common/domain/domain.exception";
import { ErrorCode } from "@/book/domain/exceptions/error-code.enum";

export class AuthorAlreadyExistsException extends DomainException {
  constructor() {
    super("Author already exists");
  }

  getErrorCode(): string {
    return ErrorCode.AUTHOR_ALREADY_EXISTS;
  }
}
