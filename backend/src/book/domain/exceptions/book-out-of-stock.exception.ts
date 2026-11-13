import { DomainException } from '@/common/domain/domain.exception';
import { ErrorCode } from './error-code.enum';

export class BookOutOfStockException extends DomainException {
  constructor() {
    super('Book is out of stock');
  }

  getErrorCode(): string {
    return ErrorCode.OUT_OF_STOCK;
  }
}
