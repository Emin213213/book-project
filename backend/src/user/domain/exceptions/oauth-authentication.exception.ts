import {DomainException} from "@/common/domain/domain.exception";
import {ErrorCode} from "@/user/domain/exceptions/error-code.enum";

export class OauthAuthenticationException  extends  DomainException {

    constructor(message: string) {
        super(message);
    }

    getErrorCode(): string {
        return ErrorCode.OAUTH_AUTHENTICATION_ERROR;
    }



}