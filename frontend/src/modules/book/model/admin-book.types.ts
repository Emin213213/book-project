export interface BookAuthor {
  readonly id: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly slug: string;
}

export interface BookCategory {
  readonly id: number;
  readonly title: string;
  readonly slug: string;
}

export interface AdminBook {
  readonly id: string;
  readonly title: string;
  readonly slug: string;
  readonly isbn: string;
  readonly description?: string;
  readonly authors: readonly BookAuthor[];
  readonly category: BookCategory;
  readonly price: number;
  readonly pages: number;
  readonly year: number;
  readonly quantity: number;
  readonly realQuantity: number;
  readonly cover?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
}

export interface AdminBookInput {
  readonly title: string;
  readonly slug: string;
  readonly isbn: string;
  readonly categoryId: string;
  readonly authorIds: readonly string[];
  readonly price: number;
  readonly year: number;
  readonly pages: number;
  readonly description: string;
  readonly quantity: number;
  readonly cover?: File;
}

export interface PaginationMetadata {
  readonly current_page: number;
  readonly last_page: number;
  readonly per_page: number;
  readonly total: number;
}

export interface AdminBooksResponse {
  readonly data: readonly AdminBook[];
  readonly meta: PaginationMetadata;
}

export interface AdminBooksQuery {
  readonly title?: string;
  readonly authorSlug?: string;
  readonly categorySlug?: string;
  readonly page?: number;
  readonly perPage?: number;
}
