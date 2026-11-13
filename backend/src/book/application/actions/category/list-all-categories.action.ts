import {ListAllDto} from "@/book/application/dto/category/list-all.dto";
import {Inject, Injectable} from "@nestjs/common";
import {
    BOOK_CATEGORY_REPOSITORY,
    type ICategoryRepository,
} from "@/book/domain/repositories/category.repository.interface";


@Injectable()
export class ListAllCategoriesAction {

    constructor(
        @Inject(BOOK_CATEGORY_REPOSITORY)
        private readonly categoryRepository: ICategoryRepository
    ) {}


      async  handle(context:ListAllDto) {
          const qb = this.categoryRepository.createBaseQuery();

          const offset = (context.page - 1) * context.per_page

          return qb
              .skip(offset)
              .take(context.per_page)
              .getManyAndCount()
    }


}