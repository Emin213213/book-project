import type { ReactElement } from "react";

import type { useAdminRolesQuery } from "../../api/useAdminRolesQuery";
import type { AdminRole } from "../../model/admin-role.types";
import styles from "../Access.module.css";
import RoleListItem from "./RoleListItem";

type RolesListContentProps = {
  readonly query: ReturnType<typeof useAdminRolesQuery>;
  readonly roles: readonly AdminRole[];
};

/** Отображает роли и состояния загрузки списка. */
export default function RolesListContent({
  query,
  roles,
}: RolesListContentProps): ReactElement {
  const { isFetching, isError } = query;

  return (
    <>
      <div className={styles.roleList} aria-busy={isFetching}>
        {roles.map((role) => (
          <RoleListItem key={role.id} role={role} />
        ))}
        {query.isLoading && (
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
              void query.refetch();
            }}
          >
            Спробувати ще раз
          </button>
        ) : null}
      </div>
    </>
  );
}
