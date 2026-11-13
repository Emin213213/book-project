import { Inject, Injectable } from '@nestjs/common';

import { Book } from '../../../domain/entities/book.entity';
import { BOOK_REPOSITORY } from '../../../domain/repositories/book.repository.interface';
import type { IBookRepository } from '../../../domain/repositories/book.repository.interface';
import { ListBooksDto } from '../../dto/book/list-books.dto';

/** Возвращает страницу книг вместе с общим количеством. */
@Injectable()
export class FindAllBooksAction {
  constructor(
    @Inject(BOOK_REPOSITORY)
    private readonly bookRepository: IBookRepository,
  ) {}

  async handle(context: ListBooksDto): Promise<[Book[], number]> {
    const qb = this.bookRepository.createBaseQuery();

    if (context.title) {
      this.bookRepository.applyTitleFilter(qb, context.title);
    }

    if (context.authorSlug) {
      this.bookRepository.applyAuthorFilter(qb, context.authorSlug);
    }

    if (context.categorySlug) {
      this.bookRepository.applyCategoryFilter(qb, context.categorySlug);
    }

    const page = context.page ?? 1;
    const perPage = context.per_page ?? 15;

    return qb
      .skip((page - 1) * perPage)
      .take(perPage)
      .getManyAndCount();
  }
}
