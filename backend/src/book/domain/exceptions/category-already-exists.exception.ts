import {DomainException} from "@/common/domain/domain.exception";
import {ErrorCode} from "@/book/domain/exceptions/error-code.enum";


export class  CategoryAlreadyExistsException extends  DomainException {

    constructor() {
        super('Category already exist');
    }

    getErrorCode(): string {
        return ErrorCode.CATEGORY_ALREADY_EXIST
    }

}