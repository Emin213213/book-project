export interface BookDiscount {
  percent: number;
  endsAt: string;
}

export interface Book {
  id: number;
  title: string;
  authorId: number;
  author: string;
  categoryId: number;
  category: string;
  year: number;
  pages: number;
  price: number;
  discount: BookDiscount | null;
  stock: number;
  description: string;
  tags: string[];
  coverUrl: string;
}

export interface BookFormData {
  title: string;
  authorId: number;
  author: string;
  categoryId: number;
  category: string;
  year: number;
  pages: number;
  price: number;
  description: string;
  tags: string[];
  coverUrl: string;
}
