import {DomainException} from "@/common/domain/domain.exception";
import {ErrorCode} from "@/user/domain/exceptions/error-code.enum";

export  class UserInvalidCredential extends DomainException{
    constructor() {
        super('User invalid credential');

    }

    getErrorCode(): string {
        return ErrorCode.INVALID_CREDENTIALS;
    }
}