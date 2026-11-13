import { API_URL } from '@/shared/config/api.ts';
import type {
  AdminBook,
  AdminBookInput,
  AdminBooksQuery,
  AdminBooksResponse,
  BookAuthor,
  BookCategory,
  PaginationMetadata,
} from '../model/admin-book.types';

const ADMIN_BOOKS_URL = `${API_URL}/book/admin/books`;

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

async function parseBookResponse(response: Response): Promise<AdminBook> {
  if (!response.ok) {
    throw new Error(`Book request failed: ${response.status}`);
  }

  return response.json() as Promise<AdminBook>;
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

  const response = await fetch(`${ADMIN_BOOKS_URL}?${searchParams.toString()}`);

  if (!response.ok) {
    throw new Error(`Failed to load admin books: ${response.status}`);
  }

  return response.json() as Promise<AdminBooksResponse>;
}

/** Получает административную карточку книги по slug. */
export async function getAdminBook(slug: string): Promise<AdminBook> {
  const response = await fetch(`${ADMIN_BOOKS_URL}/${encodeURIComponent(slug)}`);

  return parseBookResponse(response);
}

/** Создаёт книгу через multipart/form-data. */
export async function createAdminBook(input: AdminBookInput): Promise<AdminBook> {
  const response = await fetch(ADMIN_BOOKS_URL, {
    method: 'POST',
    body: createBookFormData(input),
  });

  return parseBookResponse(response);
}

/** Частично обновляет книгу по её текущему slug. */
export async function updateAdminBook(
  slug: string,
  input: Partial<AdminBookInput>,
): Promise<AdminBook> {
  const response = await fetch(`${ADMIN_BOOKS_URL}/${encodeURIComponent(slug)}`, {
    method: 'PATCH',
    body: createBookFormData(input),
  });

  return parseBookResponse(response);
}

/** Безвозвратно удаляет книгу по slug. */
export async function deleteAdminBook(slug: string): Promise<void> {
  const response = await fetch(`${ADMIN_BOOKS_URL}/${encodeURIComponent(slug)}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Book deletion failed: ${response.status}`);
  }
}

/** Получает справочники авторов и категорий для формы книги. */
export async function getAdminBookReferences(): Promise<{
  readonly authors: readonly BookAuthor[];
  readonly categories: readonly BookCategory[];
}> {
  const [authorsResponse, categoriesResponse] = await Promise.all([
    fetch(`${API_URL}/book/admin/authors?page=1&per_page=100`),
    fetch(`${API_URL}/book/admin/categories?page=1&per_page=100`),
  ]);

  if (!authorsResponse.ok || !categoriesResponse.ok) {
    throw new Error('Failed to load book form references');
  }

  const authors = (await authorsResponse.json()) as PaginatedResponse<BookAuthor>;
  const categories = (await categoriesResponse.json()) as PaginatedResponse<BookCategory>;

  return { authors: authors.data, categories: categories.data };
}
