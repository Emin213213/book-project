import { useMutation } from "@tanstack/react-query";
import type { ReactElement } from "react";

import { ACCESS_PERMISSION } from "../../model/access.constants";
import { useAccess } from "../../model/useAccess";
import { getDeleteRoleMutationOptions } from "../../api/roleMutationOptions";
import { useRolesStore } from "../../model/useRolesStore";
import styles from "../Access.module.css";

/** С подтверждением удаляет только несистемные роли. */
export default function DeleteRoleButton(): ReactElement | undefined {
  const role = useRolesStore((state) => state.editingRole);
  const { canAccess } = useAccess();
  const mutation = useMutation(getDeleteRoleMutationOptions());
  const canDelete =
    role !== undefined &&
    !role.is_system &&
    canAccess(ACCESS_PERMISSION.DELETE_ROLES);

  function handleDelete(): void {
    if (!canDelete || mutation.isPending) {
      return;
    }
    if (window.confirm(`Видалити роль «${role.name}»?`)) {
      mutation.mutate(role.id);
    }
  }

  if (!canDelete) {
    return undefined;
  }
  return (
    <div className={styles.search}>
      <button
        className={styles.danger}
        type="button"
        disabled={mutation.isPending}
        onClick={handleDelete}
      >
        {mutation.isPending ? "Видалення…" : "Видалити роль"}
      </button>
      {mutation.isError && <p role="alert">{mutation.error.message}</p>}
    </div>
  );
}
