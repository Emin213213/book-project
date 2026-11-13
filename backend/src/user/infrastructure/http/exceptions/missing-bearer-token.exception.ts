import { UnauthorizedException } from '@nestjs/common';

export class MissingBearerTokenException extends UnauthorizedException {
  constructor() {
    super('Authorization header must contain a Bearer token');
  }
}
