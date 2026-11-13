import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { BookCoverStorage } from '@/book/application/service/book-cover.storage';
import { AuthorAvatarStorage } from '@/book/application/service/author-avatar.storage';
import { Book } from '../../../../domain/entities/book.entity';
import { AuthorResource } from './author.resouces';
import { CategoryResource } from './category.resource';

/** Представляет книгу в ответе админского HTTP API. */
export class BookResource {
  @ApiProperty({
    description: 'Идентификатор книги.',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({ description: 'Название книги.', example: '1984' })
  title: string;

  @ApiProperty({
    description: 'Человекочитаемый идентификатор книги в URL.',
    example: '1984',
  })
  slug: string;

  @ApiProperty({
    description: 'ISBN книги.',
    example: '978-0-452-28423-4',
  })
  isbn: string;

  @ApiPropertyOptional({
    description: 'Описание книги.',
    example: 'Роман-антиутопия о слежке, цензуре и тоталитарной власти.',
  })
  description?: string;

  @ApiProperty({
    description: 'Авторы книги. Всегда содержит хотя бы одного автора.',
    isArray: true,
    type: () => AuthorResource,
  })
  authors: AuthorResource[];

  @ApiProperty({
    description: 'Категория книги.',
    type: () => CategoryResource,
  })
  category: CategoryResource;

  @ApiProperty({ description: 'Цена книги.', example: 299, type: Number })
  price: number;

  @ApiProperty({ description: 'Количество страниц.', example: 328, type: Number })
  pages: number;

  @ApiProperty({ description: 'Год издания.', example: 1949, type: Number })
  year: number;

  @ApiProperty({
    description: 'Заявленное количество экземпляров.',
    example: 20,
    type: Number,
  })
  quantity: number;

  @ApiProperty({
    description: 'Фактическое количество экземпляров на складе.',
    example: 20,
    type: Number,
  })
  realQuantity: number;

  @ApiPropertyOptional({
    description: 'Абсолютная ссылка на обложку.',
    example: 'http://localhost:8000/storage/book/cover.jpg',
    format: 'uri',
  })
  cover?: string;

  @ApiPropertyOptional({ format: 'date-time', type: String })
  createdAt?: Date;

  @ApiPropertyOptional({ format: 'date-time', type: String })
  updatedAt?: Date;

  /**
   * Превращает сущность книги в ресурс.
   *
   * Хранилище аватаров нужно вложенному `AuthorResource`: без него авторы
   * приехали бы без ссылок на аватарки.
   */
  static make(
    book: Book,
    bookCoverStorage: BookCoverStorage,
    authorAvatarStorage: AuthorAvatarStorage,
  ): BookResource {
    const resource = new BookResource();
    resource.id = book.id.value;
    resource.title = book.title;
    resource.slug = book.slug;
    resource.isbn = book.isbn.value;
    resource.description = book.description;
    resource.authors = AuthorResource.collection(
      book.authors,
      authorAvatarStorage,
    );
    resource.category = CategoryResource.make(book.category);
    resource.price = book.price;
    resource.pages = book.pages;
    resource.year = book.year;
    resource.quantity = book.quantity;
    resource.realQuantity = book.realQuantity;
    resource.cover = bookCoverStorage.makeUrlFoPath(book.cover);
    resource.createdAt = book.createdAt;
    resource.updatedAt = book.updatedAt;
    return resource;
  }

  static collection(
    books: Book[],
    bookCoverStorage: BookCoverStorage,
    authorAvatarStorage: AuthorAvatarStorage,
  ): BookResource[] {
    return books.map((book) =>
      BookResource.make(book, bookCoverStorage, authorAvatarStorage),
    );
  }
}
