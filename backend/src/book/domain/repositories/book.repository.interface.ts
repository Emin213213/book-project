import type { SelectQueryBuilder } from 'typeorm';
import { Book } from '../entities/book.entity';
import { Isbn } from '@/common/domain/value-objects/isbn.vo';
import { Uuid } from '@/common/domain/value-objects/uuid.vo';

export const BOOK_REPOSITORY = Symbol('BOOK_REPOSITORY');

export interface IBookRepository {
  findById(id: Uuid): Promise<Book | null>;
  findBySlug(slug: string): Promise<Book | null>;
  findByIsbn(isbn: Isbn): Promise<Book | null>;
  existsByCategory(categoryId: Uuid): Promise<boolean>;
  createBaseQuery(): SelectQueryBuilder<Book>;
  applyTitleFilter(qb: SelectQueryBuilder<Book>, title: string): void;
  applyAuthorFilter(qb: SelectQueryBuilder<Book>, authorSlug: string): void;
  applyCategoryFilter(qb: SelectQueryBuilder<Book>, categorySlug: string): void;
}
