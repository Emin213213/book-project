import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import type { AdminBook } from '../model/admin-book.types';
import { getAdminBook } from './adminBookService';

/** Загружает книгу для административного редактирования. */
export function useAdminBookQuery(slug: string | undefined): UseQueryResult<AdminBook, Error> {
  return useQuery({
    queryKey: ['admin-book', slug],
    queryFn: () => {
      if (!slug) {
        throw new Error('Book slug is required');
      }

      return getAdminBook(slug);
    },
    enabled: Boolean(slug),
  });
}
