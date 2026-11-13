import { UnauthorizedException } from '@nestjs/common';

export class InvalidSessionException extends UnauthorizedException {
  constructor() {
    super('Session is invalid or expired');
  }
}
