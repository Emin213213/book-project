import {ErrorCode} from "@/user/domain/exceptions/error-code.enum";

export  class UserFirstNameNotFoundExceptionException extends DOMException{

    constructor() {
        super('User first name is required');
    }

    getErrorCode(): string {
        return ErrorCode.USER_FIRST_NAME_REQUIRED;
    }

}