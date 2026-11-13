import type {ReactElement} from 'react';
import {useCallback, useState} from 'react';

import {useUserStore} from '@/modules/user';
import AdminCard from '@/shared/ui/admin-card/AdminCard';
import {useAdminRolesQuery} from '../api/useAdminRolesQuery';
import {useRolesInfiniteScroll} from '../model/useRolesInfiniteScroll';
import RoleListItem from './RoleListItem';
import RolePermissions from './RolePermissions';
import styles from './Access.module.css';

type RolesListProps = {
  readonly search: string;
};

/** Показывает серверный список ролей с подгрузкой и повтором ошибок. */
export default function RolesList({ search }: RolesListProps): ReactElement {
  const query = useAdminRolesQuery(search);
  const accessToken = useUserStore((state) => state.accessToken);
  const session = useUserStore((state) => state.authSessionId);
  const [selectedRoleId, setSelectedRoleId] = useState<string>();
  const roles = query.data?.pages.flatMap((page) => page.data) ?? [];
  const selectedRole = roles.find((role) => role.id === selectedRoleId) ?? roles[0];

  const { fetchNextPage, hasNextPage, isFetching, isError } = query;
  const loadNextPage = useCallback((): void => {
    if (hasNextPage && !isFetching) {
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetching]);

  const sentinelRef = useRolesInfiniteScroll({
    enabled: Boolean(hasNextPage) && !isFetching && !isError,
    loadNextPage,
  });
  return (
    <div className={styles.layout}>
      <AdminCard
        title="Ролі"
        icon="admin_panel_settings"
        headerRight={<span className={styles.badge}>{query.data?.pages[0]?.meta.total ?? 0}</span>}
      >
        <div className={styles.roleList} aria-busy={isFetching}>
          {roles.map((role) => (
            <RoleListItem
              key={role.id}
              role={role}
              selected={role.id === selectedRole?.id}
              onSelect={() => setSelectedRoleId(role.id)}
            />
          ))}
          {!accessToken && <p className={styles.empty}>Увійдіть у свій обліковий запис.</p>}
          {accessToken && query.isPending && (
            <p className={styles.empty} role="status">
              Завантаження ролей…
            </p>
          )}
          {query.isSuccess && roles.length === 0 && (
            <p className={styles.empty}>Ролей не знайдено.</p>
          )}
          {isError && (
            <p className={styles.empty} role="alert">
              {query.error.message}
            </p>
          )}
        </div>
        <div className={styles.actions}>
          {isError ? (
            <button
              type="button"
              className={styles.secondary}
              disabled={isFetching}
              onClick={() => {
                void (query.isFetchNextPageError ? fetchNextPage() : query.refetch());
              }}
            >
              Спробувати ще раз
            </button>
          ) : hasNextPage ? (
            <button
              type="button"
              className={styles.secondary}
              disabled={isFetching}
              onClick={loadNextPage}
            >
              {query.isFetchingNextPage ? 'Завантаження…' : 'Завантажити ще'}
            </button>
          ) : null}
        </div>
        <div ref={sentinelRef} aria-hidden="true" style={{ height: 1 }} />
      </AdminCard>
      <AdminCard title="Дозволи" icon="fact_check" headerRight={selectedRole?.name}>
        {selectedRole ? (
          <RolePermissions key={session} role={selectedRole} />
        ) : (
          <p className={styles.empty}>Оберіть роль для перегляду дозволів.</p>
        )}
      </AdminCard>
    </div>
  );
}
