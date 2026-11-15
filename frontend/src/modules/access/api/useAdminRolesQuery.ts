import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';

import { useUserStore } from '@/modules/user';
import type { AdminRolesResponse } from '../model/admin-role.types';
import { getAdminRoles } from './roleService';

/** Хранит список ролей отдельно для каждого поискового запроса. */
export function useAdminRolesQuery(
  role = '',
): UseQueryResult<AdminRolesResponse, Error> {
  const search = role.trim();
  const accessToken = useUserStore((state) => state.accessToken);
  const authSessionId = useUserStore((state) => state.authSessionId);
  return useQuery({
    queryKey: ['admin-roles', { role: search, session: authSessionId }],
    enabled: Boolean(accessToken),
    queryFn: ({ signal }) => getAdminRoles({ role: search, signal }),
  });
}
