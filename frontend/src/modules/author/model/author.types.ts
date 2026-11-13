export interface Author {
  id: number;
  name: string;
  country: string;
  birthYear: number;
  booksCount: number;
  photo: string | null;
}

export interface AuthorFormData {
  name: string;
  country: string;
  birthYear: number;
  photo: string | null;
}
