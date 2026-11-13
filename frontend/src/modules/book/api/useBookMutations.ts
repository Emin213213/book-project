import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseMutationResult } from '@tanstack/react-query';

import type { AdminBook, AdminBookInput } from '../model/admin-book.types';
import { createAdminBook, deleteAdminBook, updateAdminBook } from './adminBookService';

interface UpdateBookVariables {
  slug: string;
  data: Partial<AdminBookInput>;
}

/** Создаёт книгу и обновляет кеш книжных запросов. */
export function useCreateBookMutation(): UseMutationResult<AdminBook, Error, AdminBookInput> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAdminBook,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-books'] }),
  });
}

/** Изменяет книгу и обновляет кеш книжных запросов. */
export function useUpdateBookMutation(): UseMutationResult<AdminBook, Error, UpdateBookVariables> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slug, data }) => updateAdminBook(slug, data),
    onSuccess: book => {
      queryClient.setQueryData(['admin-book', book.slug], book);
      return queryClient.invalidateQueries({ queryKey: ['admin-books'] });
    },
  });
}

/** Удаляет книгу и обновляет кеш книжных запросов. */
export function useDeleteBookMutation(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAdminBook,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-books'] }),
  });
}
