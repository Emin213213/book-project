import { API_CLIENT } from "@/shared/api/apiClient";
import type {
  AdminRole,
  AdminRolesResponse,
  UpdateAdminRole,
} from "../model/admin-role.types";

type AdminRolesQuery = {
  readonly role: string;
  readonly signal?: AbortSignal;
};

/** Получает все роли с фильтром по названию. */
export async function getAdminRoles({
  role,
  signal,
}: AdminRolesQuery): Promise<AdminRolesResponse> {
  const response = await API_CLIENT.get<AdminRolesResponse>("/admin/roles", {
    params: role ? { role } : undefined,
    signal,
  });
  return response.data;
}

/** Получает выбранную роль вместе с её разрешениями. */
export async function getAdminRole(
  roleId: string,
  signal?: AbortSignal,
): Promise<AdminRole> {
  const response = await API_CLIENT.get<AdminRole>(
    `/admin/roles/${encodeURIComponent(roleId)}`,
    {
      signal,
    },
  );
  return response.data;
}

/** Сохраняет название и полный набор разрешений роли. */
export async function updateAdminRole(
  roleId: string,
  input: UpdateAdminRole,
): Promise<AdminRole> {
  const response = await API_CLIENT.patch<AdminRole>(
    `/admin/roles/${encodeURIComponent(roleId)}`,
    {
      name: input.name,
      permissions: Object.entries(input.permissions).flatMap(
        ([module, actions]) => actions.map((action) => `${module}.${action}`),
      ),
    },
  );
  return response.data;
}

/** Создаёт несистемную роль без разрешений. */
export async function createAdminRole(input: {
  readonly name: string;
  readonly slug: string;
}): Promise<AdminRole> {
  const response = await API_CLIENT.post<AdminRole>("/admin/roles", input);
  return response.data;
}

/** Удаляет несистемную роль. */
export async function deleteAdminRole(roleId: string): Promise<void> {
  await API_CLIENT.delete(`/admin/roles/${encodeURIComponent(roleId)}`);
}
