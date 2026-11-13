import {DomainException} from "@/common/domain/domain.exception";
import {ErrorCode} from "@/book/domain/exceptions/error-code.enum";


export class  CategoryNotExistException extends  DomainException {

    constructor() {
        super('Category not exist');
    }

    getErrorCode(): string {
        return ErrorCode.CATEGORY_NOT_EXIST
    }

}