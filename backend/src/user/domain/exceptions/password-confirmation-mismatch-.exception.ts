import {DomainException} from "@/common/domain/domain.exception";
import {ErrorCode} from "@/user/domain/exceptions/error-code.enum";


export class PasswordConfirmationMismatchException extends DomainException {
    constructor() {
        super('Password confirmation does not match.');
    }

    getErrorCode(): string {
        return ErrorCode.PASSWORD_CONFIRMATION_MISMATCH;
    }
}