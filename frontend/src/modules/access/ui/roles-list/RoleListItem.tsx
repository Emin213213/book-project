import type { ReactElement } from "react";

import { useRolesStore } from "../../model/useRolesStore";
import type { AdminRole } from "../../model/admin-role.types";
import styles from "../Access.module.css";

type RoleListItemProps = {
  readonly role: AdminRole;
};

/** Позволяет выбрать роль для просмотра разрешений. */
export default function RoleListItem({
  role,
}: RoleListItemProps): ReactElement {
  const selected = useRolesStore((state) => state.selectedRoleId === role.id);
  const selectRole = useRolesStore((state) => state.selectRole);

  function handleSelect(): void {
    selectRole(role.id);
  }

  return (
    <button
      type="button"
      className={`${styles.roleItem} ${selected ? styles.active : ""}`}
      aria-pressed={selected}
      onClick={handleSelect}
    >
      <span>
        <strong>{role.name}</strong>
        <small>
          {role.slug}
          {role.is_system ? " · Системна роль" : ""}
        </small>
      </span>
    </button>
  );
}
