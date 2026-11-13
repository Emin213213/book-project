import { useQuery } from '@tanstack/react-query';

import { getAdminBookReferences } from './adminBookService';

const EMPTY_REFERENCES = { authors: [], categories: [] } as const;

/** Возвращает серверные справочники формы книги. */
export function useAdminBookReferencesQuery() {
  const query = useQuery({
    queryKey: ['admin-book-references'],
    queryFn: getAdminBookReferences,
  });

  return { ...query, data: query.data ?? EMPTY_REFERENCES };
}
