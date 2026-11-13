import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useBooksQuery } from '@/modules/book';

const BOOKS_PER_PAGE = 25;

type HomeListParams = ReturnType<typeof useBooksQuery> & {
  readonly search: string;
  readonly page: number;
  readonly limit: number;
  readonly setSearch: (search: string) => void;
  readonly setPage: (page: number) => void;
};

const parsePage = (value: string | null): number => {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
};

function updateSearch(previousParams: URLSearchParams, search: string): URLSearchParams {
  const params = new URLSearchParams(previousParams);
  if (search) {
    params.set('search', search);
  } else {
    params.delete('search');
  }
  params.delete('page');
  return params;
}

function updatePage(previousParams: URLSearchParams, page: number): URLSearchParams {
  const params = new URLSearchParams(previousParams);
  params.set('page', String(page));
  return params;
}

/** Связывает список книг и его параметры с URL страницы. */
export function useHomeListParams(): HomeListParams {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') ?? '';
  const page = parsePage(searchParams.get('page'));
  const booksQuery = useBooksQuery({ search, page, limit: BOOKS_PER_PAGE });

  const setSearch = useCallback((search: string): void => {
    setSearchParams((previousParams) => updateSearch(previousParams, search));
  }, [setSearchParams]);

  const setPage = useCallback((page: number): void => {
    setSearchParams((previousParams) => updatePage(previousParams, page));
  }, [setSearchParams]);

  return { ...booksQuery, search, page, limit: BOOKS_PER_PAGE, setPage, setSearch };
}
