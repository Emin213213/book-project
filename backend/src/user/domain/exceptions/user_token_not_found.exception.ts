import {DomainException} from "@/common/domain/domain.exception";
import {ErrorCode} from "@/user/domain/exceptions/error-code.enum";


export class UserHasNoVerificationTokenException extends DomainException {
    constructor() {
        super('User does not have a verification token');
    }
    getErrorCode(): string {
        return ErrorCode.USER_VERIFICATION_TOKEN_NOT_FOUND;
    }


}