import {DomainException} from "@/common/domain/domain.exception";
import {ErrorCode} from "@/user/domain/exceptions/error-code.enum";


export  class InvalidEmailException extends  DomainException {

    constructor() {
        super('Invalid email format');
    }

    getErrorCode(): string {
        return ErrorCode.INVALID_FORMAT_EMAIL
    }

}