import {InvalidEmailException} from "@/user/domain/exceptions/invalid.email.exception";

export class Email {
  constructor(public readonly value: string) {
    if (!value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      throw new InvalidEmailException()
    }
  }

  toString(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
