import { DomainException } from '@/common/domain/domain.exception';
import { ErrorCode } from './error-code.enum';

export class BookIsbnAlreadyExistException extends DomainException {
  constructor() {
    super('Book with this ISBN already exists');
  }



  getErrorCode(): string {
    return ErrorCode.ISBN_ALREADY_EXISTS;
  }
}
