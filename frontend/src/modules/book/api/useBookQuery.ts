import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import type { Book } from '../model/book.types';
import { getBookById } from './bookService';

export function useBookQuery(id: number | undefined): UseQueryResult<Book | undefined, Error> {
  return useQuery({
    queryKey: ['book', id],
    queryFn: () => {
      if (id === undefined) {
        throw new Error('Book id is required');
      }

      return getBookById(id);
    },
    enabled: id !== undefined && Number.isFinite(id),
  });
}
