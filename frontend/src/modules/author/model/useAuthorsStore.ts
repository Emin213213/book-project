import { create } from 'zustand';
import type { Author, AuthorFormData } from './author.types';
import * as authorService from '../api/authorService.ts';

interface AuthorsState {
  authors: Author[];
  loading: boolean;
  fetchAuthors: (search?: string) => Promise<void>;
  addAuthor: (data: AuthorFormData) => Promise<Author>;
  editAuthor: (id: number, data: Partial<AuthorFormData>) => Promise<Author>;
  removeAuthor: (id: number) => Promise<void>;
}

export const useAuthorsStore = create<AuthorsState>()((set) => ({
  authors: [],
  loading: false,

  fetchAuthors: async (search) => {
    set({ loading: true });
    const authors = await authorService.getAuthors(search);
    set({ authors, loading: false });
  },

  addAuthor: async (data) => {
    const author = await authorService.createAuthor(data);
    return author;
  },

  editAuthor: async (id, data) => {
    const author = await authorService.updateAuthor(id, data);
    return author;
  },

  removeAuthor: async (id) => {
    await authorService.deleteAuthor(id);
  },
}));
