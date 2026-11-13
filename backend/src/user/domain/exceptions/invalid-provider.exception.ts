import {DomainException} from "@/common/domain/domain.exception";
import {ErrorCode} from "@/user/domain/exceptions/error-code.enum";

export  class InvalidProviderException  extends  DomainException{

    constructor() {
        super('Invalid OAuth provider.');
    }


    getErrorCode(): string {
        return ErrorCode.INVALID_OAUTH_PROVIDER;
    }


}