import { API_URL } from '@/shared/config/api';
import type { AdminRolesResponse } from '../model/admin-role.types';

const PAGE_SIZE = 25;
const ADMIN_ROLES_URL = `${API_URL}/admin/roles`;

type AdminRolesQuery = {
  readonly page: number;
  readonly role: string;
  readonly accessToken: string | undefined;
  readonly signal?: AbortSignal;
};

/** Получает страницу ролей с фильтром по названию. */
export async function getAdminRoles({
  page,
  role,
  accessToken,
  signal,
}: AdminRolesQuery): Promise<AdminRolesResponse> {
  if (!accessToken) {
    throw new Error('Увійдіть у свій обліковий запис для перегляду ролей');
  }
  const params = new URLSearchParams({ page: String(page), per_page: String(PAGE_SIZE) });
  if (role) {
    params.set('role', role);
  }
  const response = await fetch(`${ADMIN_ROLES_URL}?${params}`, {
    signal,
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    throw new Error(`Не вдалося завантажити ролі: HTTP ${response.status}`);
  }
  return response.json() as Promise<AdminRolesResponse>;
}
