import { STR_HELPER } from "@/common/application/ports/str-helper.interface";
import type { StrHelperInterface } from "@/common/application/ports/str-helper.interface";
import {Inject, Injectable} from '@nestjs/common';
import {DataSource, EntityManager} from 'typeorm';

import {BookCoverStorage} from "@/book/application/service/book-cover.storage";
import {Book} from '@/book/domain/entities/book.entity';
import {Author} from '@/book/domain/entities/author.entity';
import {Category} from '@/book/domain/entities/category.entity';
import {AuthorNotExistException} from '@/book/domain/exceptions/author-not-exist.exception';
import {BookIsbnAlreadyExistException} from '@/book/domain/exceptions/book-isbn-already-exist.exception';
import {BookSlugAlreadyExistsException} from '@/book/domain/exceptions/book-slug-already-exists.exception';
import {CategoryNotExistException} from '@/book/domain/exceptions/category-not-exist.exception';
import {CreateBookDto} from '../../dto/book/create-book.dto';
import {Uuid} from '@/common/domain/value-objects/uuid.vo';

/** Создаёт книгу вместе с её связями. */
@Injectable()
export class CreateBookAction {
    constructor(
        @Inject(STR_HELPER)
        private readonly strHelper: StrHelperInterface,
        private readonly dataSource: DataSource,
        private readonly bookStorage: BookCoverStorage,
    ) {
    }

    async handle(context: CreateBookDto): Promise<Book> {
        const id = Uuid.generate();
        const slug = this.strHelper.slug(context.slug);

        // Файл сохраняется до транзакции: сетевой и дисковый ввод-вывод не
        // должен держать соединение пула. При любой ошибке ниже файл удаляется.
        const coverPath = context.cover
            ? await this.bookStorage.saveUploadedFile(context.cover, id.value)
            : undefined;

        try {
            return await this.dataSource.transaction(async (em) => {
                // Резолв связей идёт через менеджер транзакции, а не через
                // инжектированные репозитории: те привязаны к отдельному
                // EntityManager (второе соединение пула на время открытой
                // транзакции) и читают вне снапшота транзакции.
                const category = await this.resolveCategory(em, context.categoryId);
                const authors = await this.resolveAuthors(em, context.authorIds);

                await this.assertIsbnAvailable(em, context.isbn.value);
                await this.assertSlugAvailable(em, slug);

                const book = Book.create({
                    id,
                    title: context.title,
                    slug,
                    isbn: context.isbn,
                    authors,
                    category,
                    price: context.price,
                    year: context.year,
                    pages: context.pages,
                    description: context.description,
                    quantity: context.quantity,
                });

                if (coverPath) {
                    book.changeCover(coverPath);
                }

                return em.save(book);
            });
        } catch (error) {
            if (coverPath) {
                // Best-effort: ошибка удаления файла не должна подменить
                // исходную (доменную) ошибку транзакции.
                await this.safeDeleteFile(coverPath);
            }

            throw error;
        }
    }

    private async resolveCategory(em: EntityManager, categoryId: string): Promise<Category> {
        const id = Uuid.fromString(categoryId);
        const category = await em
            .createQueryBuilder(Category, 'category')
            .where('category.id = :id', {id: id.value})
            .getOne();

        if (!category) {
            throw new CategoryNotExistException();
        }

        return category;
    }

    private async resolveAuthors(em: EntityManager, authorIds: string[]): Promise<Author[]> {
        const ids = authorIds.map((id) => Uuid.fromString(id).value);
        const authors = await em
            .createQueryBuilder(Author, 'author')
            .where('author.idValue IN (:...ids)', {ids})
            .getMany();

        if (authors.length !== authorIds.length) {
            const found = new Set(authors.map((author) => author.id.value));
            throw new AuthorNotExistException(
                authorIds.filter((id) => !found.has(id)),
            );
        }

        return authors;
    }

    // Уникальность проверяется менеджером транзакции, а не отдельным
    // репозиторием: уникальных индексов в БД нет, и это единственная защита.
    private async assertIsbnAvailable(em: EntityManager, isbn: string): Promise<void> {
        const existing = await em
            .createQueryBuilder(Book, 'book')
            .where('book.isbnValue = :isbn', {isbn})
            .getOne();

        if (existing) {
            throw new BookIsbnAlreadyExistException();
        }
    }

    private async assertSlugAvailable(em: EntityManager, slug: string): Promise<void> {
        const existing = await em
            .createQueryBuilder(Book, 'book')
            .where('book.slugValue = :slug', {slug})
            .getOne();

        if (existing) {
            throw new BookSlugAlreadyExistsException();
        }
    }

    // Компенсация best-effort: провал удаления файла-сироты не должен
    // затирать исходную ошибку, из-за которой транзакция была отклонена.
    private async safeDeleteFile(path: string): Promise<void> {
        try {
            await this.bookStorage.deleteFile(path);
        } catch {
            // проглатываем: файл остаётся сиротой, но исходная ошибка важнее
        }
    }
}
