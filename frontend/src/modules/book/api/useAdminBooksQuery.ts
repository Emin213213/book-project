import { useQuery } from '@tanstack/react-query';

import { getAdminBooks } from './adminBookService';
import type { AdminBook } from '../model/admin-book.types';

const EMPTY_BOOKS: readonly AdminBook[] = [];

interface AdminBooksQueryResult {
  books: readonly AdminBook[];
  total: number;
  isError: boolean;
  isPending: boolean;
}

/** Возвращает подготовленное серверное состояние списка книг для административной страницы. */
export function useAdminBooksQuery(title: string, page = 1): AdminBooksQueryResult {
  const { data, isError, isPending } = useQuery({
    queryKey: ['admin-books', { page, title }],
    queryFn: () => getAdminBooks({ page, title: title || undefined }),
  });

  return {
    books: data?.data ?? EMPTY_BOOKS,
    total: data?.meta.total ?? 0,
    isError,
    isPending,
  };
}
