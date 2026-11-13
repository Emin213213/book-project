import {DomainException} from "@/common/domain/domain.exception";
import {ErrorCode} from "@/book/domain/exceptions/error-code.enum";


export class  BookAlreadyExistsException extends  DomainException {

    constructor() {
        super('Book already exist');
    }

    getErrorCode(): string {
        return ErrorCode.BOOK_ALREADY_EXIST
    }

}