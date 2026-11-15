import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { useUserStore } from "@/modules/user";
import { canAccess, createAppAbility } from "./ability";
import type { AccessPermission } from "./access.types";
import { getCurrentPermissions } from "../api/accessService";

const ACCESS_REFRESH_INTERVAL = 30_000;
const NO_PERMISSIONS: readonly string[] = [];

type AccessState = {
  readonly canAccess: (permission: AccessPermission) => boolean;
  readonly isPending: boolean;
  readonly error: Error | undefined;
  readonly retry: () => void;
};

/** Не сохраняет права в localStorage; до загрузки и при ошибке доступ закрыт. */
export function useAccess(): AccessState {
  const token = useUserStore((state) => state.accessToken);
  const session = useUserStore((state) => state.authSessionId);
  const query = useQuery({
    queryKey: ["current-permissions", { session }],
    queryFn: ({ signal }) => getCurrentPermissions(signal),
    enabled: Boolean(token),
    staleTime: ACCESS_REFRESH_INTERVAL,
    refetchInterval: ACCESS_REFRESH_INTERVAL,
    refetchOnWindowFocus: "always",
    retry: false,
  });
  const permissions =
    token && !query.isError ? (query.data ?? NO_PERMISSIONS) : NO_PERMISSIONS;
  const ability = useMemo(() => createAppAbility(permissions), [permissions]);
  return {
    canAccess: (permission) => canAccess(ability, permission),
    isPending: Boolean(token) && query.isPending,
    error: query.error ?? undefined,
    retry: () => {
      void query.refetch();
    },
  };
}
