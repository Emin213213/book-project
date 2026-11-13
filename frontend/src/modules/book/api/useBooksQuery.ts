import { useQuery } from '@tanstack/react-query';

import { getBooks } from './bookService';
import type { BooksQuery, BooksResponse } from './bookService';

type BooksQueryResult = Readonly<BooksResponse & {
  isPending: boolean;
}>;

/** Возвращает книги, общее количество и состояние загрузки. */
export function useBooksQuery(params: BooksQuery = {}): BooksQueryResult {
  const booksQuery = useQuery({
    queryKey: ['books', params],
    queryFn: () => getBooks(params),
  });
  return {
    books: booksQuery.data?.books ?? [],
    total: booksQuery.data?.total ?? 0,
    isPending: booksQuery.isPending,
  };
}

