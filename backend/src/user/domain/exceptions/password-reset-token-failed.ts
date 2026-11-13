import {DomainException} from "@/common/domain/domain.exception";
import {ErrorCode} from "@/user/domain/exceptions/error-code.enum";

export  class PasswordResetTokenFailed extends DomainException{
    constructor() {
        super('Failed to generate password reset token');

    }

    getErrorCode(): string {
        return ErrorCode.FAILED_GENERATE_TOKEN;
    }
}