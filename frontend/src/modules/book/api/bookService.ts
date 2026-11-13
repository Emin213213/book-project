import type { Book, BookFormData } from '../model/book.types';
import initialBooks from './books.json';

let books: Book[] = [...initialBooks];
let nextId = Math.max(...books.map(b => b.id)) + 1;

export interface BooksQuery {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export interface BooksResponse {
  books: Book[];
  total: number;
}

export async function getBooks(params?: BooksQuery): Promise<BooksResponse> {
  let filtered = [...books];
  const { search, category, page = 1, limit = 6 } = params ?? {};

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      b => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q),
    );
  }

  if (category) {
    filtered = filtered.filter(b => b.category === category);
  }

  const total = filtered.length;
  const start = (page - 1) * limit;
  const paged = filtered.slice(start, start + limit);

  return { books: paged, total };
}

export async function getBookById(id: number): Promise<Book | undefined> {
  return books.find(b => b.id === id);
}

export async function createBook(data: BookFormData): Promise<Book> {
  const book: Book = { ...data, id: nextId++, discount: null, stock: 0 };
  books.push(book);
  return book;
}

export async function updateBook(id: number, data: Partial<Book>): Promise<Book> {
  const idx = books.findIndex(b => b.id === id);
  if (idx === -1) throw new Error('Book not found');
  books[idx] = { ...books[idx], ...data };
  return books[idx];
}

export async function deleteBook(id: number): Promise<void> {
  books = books.filter(b => b.id !== id);
}

export async function getAllBooks(): Promise<Book[]> {
  return [...books];
}
