/** Права доступа к книгам, авторам и категориям. */
export const Permissions = {
  VIEW_BOOKS: "books.view",
  CREATE_BOOKS: "books.create",
  UPDATE_BOOKS: "books.update",
  DELETE_BOOKS: "books.delete",

  VIEW_AUTHORS: "authors.view",
  CREATE_AUTHORS: "authors.create",
  UPDATE_AUTHORS: "authors.update",
  DELETE_AUTHORS: "authors.delete",

  VIEW_CATEGORIES: "categories.view",
  CREATE_CATEGORIES: "categories.create",
  UPDATE_CATEGORIES: "categories.update",
  DELETE_CATEGORIES: "categories.delete",
} as const;

export type PermissionType = (typeof Permissions)[keyof typeof Permissions];

export const ALL_PERMISSIONS: readonly PermissionType[] = Object.values(Permissions);
