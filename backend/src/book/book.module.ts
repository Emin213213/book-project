import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {Book} from './domain/entities/book.entity';
import {BookRepository} from './infrastructure/book.repository';
import {BookController} from './infrastructure/http/admin/book.controller';
import {BOOK_REPOSITORY} from './domain/repositories/book.repository.interface';
import {FindAllBooksAction} from './application/actions/book/find-all-books.action';
import {CreateBookAction} from './application/actions/book/create-book.action';
import {UpdateBookAction} from './application/actions/book/update-book.action';
import {DeleteBookAction} from './application/actions/book/delete-book.action';
import {CategoryController} from "@/book/infrastructure/http/admin/category.controller";
import {RouterModule} from "@nestjs/core";
import {CreateCategoryAction} from "@/book/application/actions/category/create-category.action";
import {BOOK_CATEGORY_REPOSITORY} from "@/book/domain/repositories/category.repository.interface";
import {CategoryRepository} from "@/book/infrastructure/repository/category.repository";
import {ListAllCategoriesAction} from "@/book/application/actions/category/list-all-categories.action";
import {UpdateCategoryAction} from "@/book/application/actions/category/update-category.action";
import {DeleteCategoryAction} from "@/book/application/actions/category/delete-category.action";
import {Category} from "@/book/domain/entities/category.entity";
import {AuthorController} from "@/book/infrastructure/http/admin/author.controller";
import {AuthorsRepository} from "@/book/infrastructure/repository/authors.repository";
import {AUTHOR_REPOSITORY} from "@/book/domain/repositories/author.repository.interface";
import {Author} from "@/book/domain/entities/author.entity";
import {ListAllAuthorsAction} from "@/book/application/actions/authors/list-all-authors.action";
import {CreateAuthorAction} from "@/book/application/actions/authors/create-author.action";
import {UpdateAuthorAction} from "@/book/application/actions/authors/update-author.action";
import {AuthorAvatarStorage} from "@/book/application/service/author-avatar.storage";
import {BookCoverStorage} from "@/book/application/service/book-cover.storage";

@Module({
    imports: [
        TypeOrmModule.forFeature([Book,Category,Author]),
        RouterModule.register([
        {
            path: 'book',
            module: BookModule
        }
    ]),],
    controllers: [BookController, CategoryController,AuthorController],
    providers: [
        FindAllBooksAction,
        CreateBookAction,
        ListAllCategoriesAction,
        DeleteCategoryAction,
        UpdateCategoryAction,
        UpdateBookAction,
        DeleteBookAction,
        ListAllAuthorsAction,
        CreateCategoryAction,
        CreateAuthorAction,
        UpdateAuthorAction,
        AuthorAvatarStorage,
        BookCoverStorage,
        AuthorsRepository,
        {
            provide: BOOK_REPOSITORY,
            useClass: BookRepository,
        },
        {
            provide: AUTHOR_REPOSITORY,
            useExisting: AuthorsRepository,
        },
        CategoryRepository,
        {
            provide: BOOK_CATEGORY_REPOSITORY,
            useExisting: CategoryRepository,
        },

    ],
})
export class BookModule {
}
