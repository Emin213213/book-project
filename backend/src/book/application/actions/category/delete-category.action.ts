import {Inject, Injectable} from "@nestjs/common";

import {CategoryHasBooksException} from "@/book/domain/exceptions/category-has-books.exception";
import {CategoryNotExistException} from "@/book/domain/exceptions/category-not-exist.exception";
import {
    BOOK_CATEGORY_REPOSITORY,
    type ICategoryRepository,
} from "@/book/domain/repositories/category.repository.interface";
import {
    BOOK_REPOSITORY,
    type IBookRepository,
} from "@/book/domain/repositories/book.repository.interface";

/** Удаляет категорию, за которой не числится ни одной книги. */
@Injectable()
export class DeleteCategoryAction {

    constructor(
        @Inject(BOOK_CATEGORY_REPOSITORY)
        private readonly categoryRepository: ICategoryRepository,
        @Inject(BOOK_REPOSITORY)
        private readonly bookRepository: IBookRepository,
    ) {
    }

    public async handle(slug: string): Promise<void> {
        const category = await this.categoryRepository.findBySlug(slug)

        if (!category) {
            throw new CategoryNotExistException()
        }

        // Внешний ключ стоит на RESTRICT: без этой проверки MySQL вернул бы
        // ошибку ограничения, и клиент получил бы 500 вместо осмысленной 400.
        if (await this.bookRepository.existsByCategory(category.id)) {
            throw new CategoryHasBooksException()
        }

        await this.categoryRepository.remove(category)
    }
}
