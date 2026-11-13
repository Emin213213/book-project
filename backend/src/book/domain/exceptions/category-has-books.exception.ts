import { DomainException } from "@/common/domain/domain.exception";

import { ErrorCode } from "./error-code.enum";

export class CategoryHasBooksException extends DomainException {
  constructor() {
    super("Category cannot be deleted while it has books");
  }

  getErrorCode(): string {
    return ErrorCode.CATEGORY_HAS_BOOKS;
  }
}
