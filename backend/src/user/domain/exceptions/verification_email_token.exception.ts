import { BadRequestException } from "@nestjs/common";
import {DomainException} from "@/common/domain/domain.exception";
import {ErrorCode} from "@/user/domain/exceptions/error-code.enum";

export class VerificationEmailTokenException extends DomainException {
    constructor() {
        super("Invalid verification email token");
    }

    getErrorCode(): string {
        return ErrorCode.VERIFICATION_EMAIL_TOKEN_INVALID;
    }
}