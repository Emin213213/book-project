import { STR_HELPER } from "@/common/application/ports/str-helper.interface";
import type { StrHelperInterface } from "@/common/application/ports/str-helper.interface";
import {Inject, Injectable} from '@nestjs/common';
import {DataSource, EntityManager} from 'typeorm';

import {BookCoverStorage} from '@/book/application/service/book-cover.storage';
import {Book} from '../../../domain/entities/book.entity';
import {Author} from '@/book/domain/entities/author.entity';
import {Category} from '@/book/domain/entities/category.entity';
import {AuthorNotExistException} from '@/book/domain/exceptions/author-not-exist.exception';
import {BookIsbnAlreadyExistException} from '../../../domain/exceptions/book-isbn-already-exist.exception';
import {BookSlugAlreadyExistsException} from '@/book/domain/exceptions/book-slug-already-exists.exception';
import {CategoryNotExistException} from '@/book/domain/exceptions/category-not-exist.exception';
import {UpdateBookDto} from '../../dto/book/update-book.dto';
import {Uuid} from '@/common/domain/value-objects/uuid.vo';

/** Частично обновляет книгу и её связи. */
@Injectable()
export class UpdateBookAction {
    constructor(
        @Inject(STR_HELPER)
        private readonly strHelper: StrHelperInterface,
        private readonly dataSource: DataSource,
        private readonly bookStorage: BookCoverStorage,
    ) {
    }

    async handle(
        book: Book,
        context: UpdateBookDto,
        cover?: Express.Multer.File,
    ): Promise<Book> {
        const previousCover = book.cover;

        const coverPath = cover
            ? await this.bookStorage.saveUploadedFile(cover, book.id.value)
            : undefined;

        let updated: Book;

        try {
            updated = await this.dataSource.transaction(async (em) => {
                if (this.isProvided(context.title)) {
                    book.changeTitle(context.title);
                }

                if (this.isProvided(context.slug)) {
                    const slug = this.strHelper.slug(context.slug);
                    await this.assertSlugAvailable(em, slug, book.id);
                    book.changeSlug(slug);
                }

                if (this.isProvided(context.isbn)) {
                    await this.assertIsbnAvailable(em, context.isbn.value, book.id);
                    book.changeIsbn(context.isbn);
                }

                if (this.isProvided(context.categoryId)) {
                    book.changeCategory(await this.resolveCategory(em, context.categoryId));
                }

                if (this.isProvided(context.authorIds)) {
                    book.changeAuthors(await this.resolveAuthors(em, context.authorIds));
                }

                if (this.isProvided(context.price)) {
                    book.changePrice(context.price);
                }

                if (this.isProvided(context.year)) {
                    book.changePublicationYear(context.year);
                }

                if (this.isProvided(context.pages)) {
                    book.changePages(context.pages);
                }

                if (this.isProvided(context.description)) {
                    book.changeDescription(context.description);
                }

                if (this.isProvided(context.quantity)) {
                    book.changeQuantity(context.quantity);
                }

                if (coverPath) {
                    book.changeCover(coverPath);
                }

                return em.save(book);
            });
        } catch (error) {
            if (coverPath) {
                // Best-effort: компенсация нового файла не должна подменить
                // исходную (доменную) ошибку отклонённой транзакции.
                await this.safeDeleteFile(coverPath);
            }

            throw error;
        }

        // Старый файл убирается только после успешного коммита: строка в БД
        // уже указывает на новую обложку, откатывать нечего. Компенсация
        // best-effort — провал удаления файла-сироты не должен превращать
        // успешный ответ в 500.
        if (coverPath && previousCover) {
            await this.safeDeleteFile(previousCover);
        }

        return updated;
    }

    // `PartialType` навешивает `@IsOptional()` на каждое поле `UpdateBookDto`,
    // а `@IsOptional()` из class-validator пропускает валидацию как при
    // `undefined`, так и при `null`. Поэтому поле со значением `null` доезжает
    // сюда, минуя валидацию, — трактуем его так же, как отсутствующее (PATCH
    // не трогает поле), а не как команду присвоить `null` доменному объекту.
    private isProvided<T>(value: T | null | undefined): value is T {
        return value !== undefined && value !== null;
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

    // Сама книга исключается из проверки: иначе PATCH с текущим значением
    // падал бы на «уже занято».
    private async assertSlugAvailable(
        em: EntityManager,
        slug: string,
        id: Uuid,
    ): Promise<void> {
        const existing = await em
            .createQueryBuilder(Book, 'book')
            .where('book.slugValue = :slug', {slug})
            .andWhere('book.idValue != :id', {id: id.value})
            .getOne();

        if (existing) {
            throw new BookSlugAlreadyExistsException();
        }
    }

    private async assertIsbnAvailable(
        em: EntityManager,
        isbn: string,
        id: Uuid,
    ): Promise<void> {
        const existing = await em
            .createQueryBuilder(Book, 'book')
            .where('book.isbnValue = :isbn', {isbn})
            .andWhere('book.idValue != :id', {id: id.value})
            .getOne();

        if (existing) {
            throw new BookIsbnAlreadyExistException();
        }
    }

    // Компенсация best-effort: провал удаления файла (нового при откате или
    // старого после коммита) не должен затирать исходный результат операции.
    private async safeDeleteFile(path: string): Promise<void> {
        try {
            await this.bookStorage.deleteFile(path);
        } catch {
            // проглатываем: файл остаётся сиротой, но это не должно менять
            // ни успешный ответ, ни исходную ошибку
        }
    }
}
