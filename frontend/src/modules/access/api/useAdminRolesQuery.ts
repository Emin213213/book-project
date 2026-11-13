import { useInfiniteQuery } from '@tanstack/react-query';
import type { InfiniteData, UseInfiniteQueryResult } from '@tanstack/react-query';

import { useUserStore } from '@/modules/user';
import type { AdminRolesResponse } from '../model/admin-role.types';
import { getAdminRoles } from './roleService';

/** Хранит страницы ролей отдельно для каждого поискового запроса. */
export function useAdminRolesQuery(
  role = '',
): UseInfiniteQueryResult<InfiniteData<AdminRolesResponse>, Error> {
  const search = role.trim();
  const accessToken = useUserStore((state) => state.accessToken);
  const authSessionId = useUserStore((state) => state.authSessionId);
  return useInfiniteQuery({
    queryKey: ['admin-roles', { role: search, session: authSessionId }],
    initialPageParam: 1,
    enabled: Boolean(accessToken),
    queryFn: ({ pageParam, signal }) =>
      getAdminRoles({ page: pageParam, role: search, accessToken, signal }),
    getNextPageParam: ({ meta }) =>
      meta.current_page < meta.last_page ? meta.current_page + 1 : undefined,
  });
}
