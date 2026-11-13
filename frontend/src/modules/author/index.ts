export {
  createAuthor,
  deleteAuthor,
  getAuthorById,
  getAuthors,
  updateAuthor,
} from './api/authorService';
export type { Author, AuthorFormData } from './model/author.types';
export { useAuthorsStore } from './model/useAuthorsStore';
