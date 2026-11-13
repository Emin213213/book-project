import {Inject, Injectable} from "@nestjs/common";
import {ListAllDTO} from "@/book/application/dto/authors/list-all.dto";
import {AUTHOR_REPOSITORY, IAuthorRepository} from "@/book/domain/repositories/author.repository.interface";
import {Author} from "@/book/domain/entities/author.entity";


@Injectable()
export class ListAllAuthorsAction {

    constructor(
        @Inject(AUTHOR_REPOSITORY) private  readonly authorRepository: IAuthorRepository
    ) {
    }


    public handle(context: ListAllDTO):Promise<[Author[],number]> {
const qb = this.authorRepository.createBaseQuery()

        const offset = (context.page - 1) * context.per_page

        return qb
            .skip(offset)
            .take(context.per_page)
            .getManyAndCount()
    }

}