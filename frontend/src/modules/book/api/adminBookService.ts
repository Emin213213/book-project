import { API_CLIENT } from '@/shared/api/apiClient';
import type {
  AdminBook,
  AdminBookInput,
  AdminBooksQuery,
  AdminBooksResponse,
  BookAuthor,
  BookCategory,
  PaginationMetadata,
} from '../model/admin-book.types';

const ADMIN_BOOKS_URL = '/book/admin/books';

interface PaginatedResponse<T> {
  readonly data: readonly T[];
  readonly meta: PaginationMetadata;
}

function createBookFormData(input: Partial<AdminBookInput>): FormData {
  const formData = new FormData();

  for (const [field, value] of Object.entries(input)) {
    if (value === undefined) {
      continue;
    }

    if (field === 'authorIds' && Array.isArray(value)) {
      value.forEach(authorId => formData.append('authorIds', String(authorId)));
      continue;
    }

    formData.append(field, value instanceof File ? value : String(value));
  }

  return formData;
}

/** Получает список книг для административной таблицы. */
export async function getAdminBooks(query: AdminBooksQuery = {}): Promise<AdminBooksResponse> {
  const searchParams = new URLSearchParams({
    page: String(query.page ?? 1),
    per_page: String(query.perPage ?? 15),
  });

  if (query.title) {
    searchParams.set('title', query.title);
  }

  if (query.authorSlug) {
    searchParams.set('authorSlug', query.authorSlug);
  }

  if (query.categorySlug) {
    searchParams.set('categorySlug', query.categorySlug);
  }

  const response = await API_CLIENT.get<AdminBooksResponse>(ADMIN_BOOKS_URL, {
    params: searchParams,
  });
  return response.data;
}

/** Получает административную карточку книги по slug. */
export async function getAdminBook(slug: string): Promise<AdminBook> {
  const response = await API_CLIENT.get<AdminBook>(`${ADMIN_BOOKS_URL}/${encodeURIComponent(slug)}`);
  return response.data;
}

/** Создаёт книгу через multipart/form-data. */
export async function createAdminBook(input: AdminBookInput): Promise<AdminBook> {
  const response = await API_CLIENT.post<AdminBook>(ADMIN_BOOKS_URL, createBookFormData(input));
  return response.data;
}

/** Частично обновляет книгу по её текущему slug. */
export async function updateAdminBook(
  slug: string,
  input: Partial<AdminBookInput>,
): Promise<AdminBook> {
  const response = await API_CLIENT.patch<AdminBook>(
    `${ADMIN_BOOKS_URL}/${encodeURIComponent(slug)}`,
    createBookFormData(input),
  );
  return response.data;
}

/** Безвозвратно удаляет книгу по slug. */
export async function deleteAdminBook(slug: string): Promise<void> {
  await API_CLIENT.delete(`${ADMIN_BOOKS_URL}/${encodeURIComponent(slug)}`);
}

/** Получает справочники авторов и категорий для формы книги. */
export async function getAdminBookReferences(): Promise<{
  readonly authors: readonly BookAuthor[];
  readonly categories: readonly BookCategory[];
}> {
  const [authorsResponse, categoriesResponse] = await Promise.all([
    API_CLIENT.get<PaginatedResponse<BookAuthor>>('/book/admin/authors', {
      params: { page: 1, per_page: 100 },
    }),
    API_CLIENT.get<PaginatedResponse<BookCategory>>('/book/admin/categories', {
      params: { page: 1, per_page: 100 },
    }),
  ]);
  return { authors: authorsResponse.data.data, categories: categoriesResponse.data.data };
}
