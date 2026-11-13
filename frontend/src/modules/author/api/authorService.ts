import type { Author, AuthorFormData } from '../model/author.types';
import initialAuthors from './authors.json';

let authors: Author[] = [...initialAuthors];
let nextId = Math.max(...authors.map(a => a.id)) + 1;

export async function getAuthors(search?: string): Promise<Author[]> {
  if (!search) return [...authors];
  const q = search.toLowerCase();
  return authors.filter(a => a.name.toLowerCase().includes(q));
}

export async function getAuthorById(id: number): Promise<Author | undefined> {
  return authors.find(a => a.id === id);
}

export async function createAuthor(data: AuthorFormData): Promise<Author> {
  const author: Author = { ...data, id: nextId++, booksCount: 0 };
  authors.push(author);
  return author;
}

export async function updateAuthor(id: number, data: Partial<AuthorFormData>): Promise<Author> {
  const idx = authors.findIndex(a => a.id === id);
  if (idx === -1) throw new Error('Author not found');
  authors[idx] = { ...authors[idx], ...data };
  return authors[idx];
}

export async function deleteAuthor(id: number): Promise<void> {
  authors = authors.filter(a => a.id !== id);
}
