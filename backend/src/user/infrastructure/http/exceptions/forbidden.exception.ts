import { ForbiddenException as NestForbiddenException } from '@nestjs/common';

/** Ошибка доступа при отсутствии необходимых прав. */
export class ForbiddenException extends NestForbiddenException {
  constructor() {
    super('Insufficient permissions');
  }
}
