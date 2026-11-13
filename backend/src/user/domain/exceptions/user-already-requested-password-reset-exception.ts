import {DomainException} from "@/common/domain/domain.exception";
import {ErrorCode} from "@/user/domain/exceptions/error-code.enum";


export  class UserAlreadyRequestedPasswordResetException extends DomainException {
    constructor() {
        super('A password reset request has already been made. Please check your email.');
    }

    getErrorCode(): string {
        return ErrorCode.PASSWORD_RESET_ALREADY_REQUESTED;
    }
}