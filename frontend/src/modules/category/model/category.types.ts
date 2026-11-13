export interface Category {
  id: number;
  name: string;
  slug: string;
  booksCount: number;
  parentId: number | null;
  order: number;
}

export interface CategoryFormData {
  name: string;
  slug: string;
  parentId?: number | null;
}
