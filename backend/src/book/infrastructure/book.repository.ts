import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Book } from '../domain/entities/book.entity';
import type { IBookRepository } from '../domain/repositories/book.repository.interface';
import { Isbn } from '@/common/domain/value-objects/isbn.vo';
import { Uuid } from '@/common/domain/value-objects/uuid.vo';

@Injectable()
export class BookRepository implements IBookRepository {
  constructor(
    @InjectRepository(Book)
    private readonly repository: Repository<Book>,
  ) {}

  /**
   * Базовый запрос с подтянутыми связями.
   *
   * Без этих джойнов ресурс отдаст `undefined` вместо авторов и категории.
   */
  createBaseQuery(): SelectQueryBuilder<Book> {
    return this.repository
      .createQueryBuilder('book')
      .leftJoinAndSelect('book.authorsValue', 'author')
      .leftJoinAndSelect('book.categoryValue', 'category');
  }

  async findById(id: Uuid): Promise<Book | null> {
    return this.createBaseQuery()
      .where('book.idValue = :id', { id: id.value })
      .getOne();
  }

  async findBySlug(slug: string): Promise<Book | null> {
    return this.createBaseQuery()
      .where('book.slugValue = :slug', { slug })
      .getOne();
  }

  async findByIsbn(isbn: Isbn): Promise<Book | null> {
    return this.createBaseQuery()
      .where('book.isbnValue = :isbn', { isbn: isbn.value })
      .getOne();
  }

  /** Нужен, чтобы удаление категории с книгами падало осмысленной 400, а не ошибкой FK. */
  async existsByCategory(categoryId: Uuid): Promise<boolean> {
    const count = await this.repository
      .createQueryBuilder('book')
      .where('book.category_id = :categoryId', { categoryId: categoryId.value })
      .getCount();

    return count > 0;
  }

  applyTitleFilter(qb: SelectQueryBuilder<Book>, title: string): void {
    qb.andWhere('book.titleValue LIKE :title', { title: `%${title}%` });
  }

  /**
   * Фильтрует книги по slug автора через EXISTS, а не по join-алиасу.
   *
   * Условие на алиас `author` отрезало бы от каждой книги всех авторов, кроме
   * совпавшего, — коллекция в ответе стала бы неполной.
   */
  applyAuthorFilter(qb: SelectQueryBuilder<Book>, authorSlug: string): void {
    qb.andWhere(
      `EXISTS (
         SELECT 1 FROM book_authors ba
         INNER JOIN authors a ON a.id = ba.author_id
         WHERE ba.book_id = book.id AND a.slug = :authorSlug
       )`,
      { authorSlug },
    );
  }

  applyCategoryFilter(qb: SelectQueryBuilder<Book>, categorySlug: string): void {
    qb.andWhere('category.slug = :categorySlug', { categorySlug });
  }
}
