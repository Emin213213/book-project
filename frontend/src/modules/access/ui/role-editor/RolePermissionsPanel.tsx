import { useEffect } from "react";
import type { ReactElement } from "react";

import { useUserStore } from "@/modules/user/index";
import { useRolesStore } from "../../model/useRolesStore";
import { ACCESS_PERMISSION } from "../../model/access.constants";
import { useAccess } from "../../model/useAccess";
import { useAdminRoleQuery } from "../../api/useAdminRoleQuery";
import type { AdminRole } from "../../model/admin-role.types";
import styles from "../Access.module.css";
import DeleteRoleButton from "./DeleteRoleButton";
import RolePermissions from "./RolePermissions";

/** Загружает роль и передаёт её разрешения редактору. */
export default function RolePermissionsPanel({
  role,
}: {
  readonly role: AdminRole;
}): ReactElement {
  const { canAccess } = useAccess();
  const canViewPermissions = canAccess(ACCESS_PERMISSION.VIEW_PERMISSIONS);
  const query = useAdminRoleQuery(role.id, canViewPermissions);
  const session = useUserStore((state) => state.authSessionId);
  const editingRoleId = useRolesStore((state) => state.editingRole?.id);
  const openEditor = useRolesStore((state) => state.openEditor);
  const closeEditor = useRolesStore((state) => state.closeEditor);
  const loadedRole = canViewPermissions ? query.data : role;

  useEffect(() => {
    if (loadedRole) {
      openEditor(loadedRole, session);
    }
  }, [loadedRole, openEditor, session]);

  useEffect(() => closeEditor, [closeEditor]);

  function handleRetry(): void {
    void query.refetch();
  }

  if (!canViewPermissions) {
    return (
      <>
        {editingRoleId === role.id && <RolePermissions />}
        <p className={styles.notice}>
          Немає дозволу на перегляд дозволів ролі.
        </p>
        <DeleteRoleButton />
      </>
    );
  }

  if (query.isPending) {
    return (
      <p className={styles.empty} role="status">
        Завантаження дозволів…
      </p>
    );
  }

  if (query.isError) {
    return (
      <div className={styles.empty}>
        <p role="alert">{query.error.message}</p>
        <button
          type="button"
          className={styles.secondary}
          onClick={handleRetry}
        >
          Спробувати ще раз
        </button>
      </div>
    );
  }

  return (
    <>
      {editingRoleId === role.id && <RolePermissions />}
      <DeleteRoleButton />
    </>
  );
}
