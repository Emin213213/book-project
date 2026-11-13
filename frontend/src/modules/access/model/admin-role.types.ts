/** Роль в ответе административного API. */
export type AdminRole = {
  readonly id: string;
  readonly name: string;
  readonly slug: string;
  readonly is_system: boolean;
  readonly permissions: Readonly<Record<string, readonly string[]>>;
};

/** Страница ролей с метаданными пагинации. */
export type AdminRolesResponse = {
  readonly data: readonly AdminRole[];
  readonly meta: {
    readonly current_page: number;
    readonly last_page: number;
    readonly per_page: number;
    readonly total: number;
  };
};
