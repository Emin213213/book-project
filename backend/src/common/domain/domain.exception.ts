import {HttpStatus} from "@nestjs/common";

export abstract class DomainException extends Error {
  public readonly statusCode: number = HttpStatus.BAD_REQUEST

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }

  abstract getErrorCode(): string;
}
