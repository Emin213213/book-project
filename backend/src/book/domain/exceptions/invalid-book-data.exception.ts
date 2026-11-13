import { DomainException } from "@/common/domain/domain.exception";

import { ErrorCode } from "./error-code.enum";

/** Сообщает о нарушении инварианта одного поля книги. */
export class InvalidBookDataException extends DomainException {
  constructor(field: string, rule: string) {
    super(`Book ${field} ${rule}`);
  }

  getErrorCode(): string {
    return ErrorCode.BOOK_INVALID_DATA;
  }
}
