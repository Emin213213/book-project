import { useQuery } from '@tanstack/react-query';

import type { Book } from '../model/book.types';
import { getAllBooks } from './bookService';

const EMPTY_BOOKS: Book[] = [];

interface AllBooksQueryResult {
  books: Book[];
  isError: boolean;
  isPending: boolean;
}

/** Возвращает полный список книг и состояние запроса. */
export function useAllBooksQuery(): AllBooksQueryResult {
  const { data, isError, isPending } = useQuery({
    queryKey: ['books', 'all'],
    queryFn: getAllBooks,
  });

  return { books: data ?? EMPTY_BOOKS, isError, isPending };
}
