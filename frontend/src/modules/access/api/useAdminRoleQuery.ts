import { useQuery } from "@tanstack/react-query";
import type { UseQueryResult } from "@tanstack/react-query";

import { useUserStore } from "@/modules/user";
import type { AdminRole } from "../model/admin-role.types";
import { getAdminRole } from "./roleService";

/** Загружает разрешения выбранной роли в рамках текущей сессии. */
export function useAdminRoleQuery(
  roleId: string,
  enabled = true,
): UseQueryResult<AdminRole, Error> {
  const session = useUserStore((state) => state.authSessionId);
  return useQuery({
    enabled,
    queryKey: ["admin-role", { roleId, session }],
    queryFn: ({ signal }) => getAdminRole(roleId, signal),
    refetchOnMount: "always",
  });
}
