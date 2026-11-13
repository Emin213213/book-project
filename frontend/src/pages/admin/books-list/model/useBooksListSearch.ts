import { useState } from 'react';

interface BooksListSearch {
  search: string;
  setSearch: (search: string) => void;
}

/** Управляет локальным значением строки поиска списка книг. */
export function useBooksListSearch(): BooksListSearch {
  const [search, setSearch] = useState('');

  return { search, setSearch };
}
