import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { BookCoverStorage } from '@/book/application/service/book-cover.storage';
import { Book } from '../../../domain/entities/book.entity';

/** Удаляет книгу вместе с файлом обложки. */
@Injectable()
export class DeleteBookAction {
  constructor(
    private readonly dataSource: DataSource,
    private readonly bookStorage: BookCoverStorage,
  ) {}

  async handle(book: Book): Promise<void> {
    const cover = book.cover;

    await this.dataSource.transaction(async (em) => {
      await em.remove(book);
    });

    // Файл удаляется после коммита: иначе откат оставил бы книгу без обложки.
    // Удаление записи уже закоммичено, так что провал очистки файла — это
    // best-effort: он не должен превращать успешный DELETE в 500 (и на
    // повторный DELETE книги уже не будет — получится ложный 404).
    if (cover) {
      try {
        await this.bookStorage.deleteFile(cover);
      } catch {
        // проглатываем: файл остаётся сиротой, но операция уже завершена успешно
      }
    }
  }
}
