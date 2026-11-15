/** Роль в ответе административного API. */
export type AdminRole = {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly is_system: boolean;
  readonly permissions: Readonly<Record<string, readonly string[]>>;
};

/** Список всех ролей, соответствующих поиску. */
export type AdminRolesResponse = {
  readonly data: readonly AdminRole[];
};

/** Поля формы редактирования роли. */
export type UpdateAdminRole = {
  readonly name: string;
  readonly permissions: AdminRole["permissions"];
};
