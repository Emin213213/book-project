import type { ReactElement } from "react";
import { useEffect } from "react";
import type { ChangeEvent } from "react";

import { useRolesStore } from "../../model/useRolesStore";

import { useUserStore } from "@/modules/user/index";
import AdminCard from "@/shared/ui/admin-card/AdminCard";
import { useAdminRolesQuery } from "../../api/useAdminRolesQuery";
import styles from "../Access.module.css";
import RolePermissionsPanel from "../role-editor/RolePermissionsPanel";
import RolesListContent from "./RolesListContent";

/** Связывает выбор роли в списке с панелью её разрешений. */
export default function RolesWorkspace(): ReactElement {
  const search = useRolesStore((state) => state.search);
  const selectedRoleId = useRolesStore((state) => state.selectedRoleId);
  const changeSearch = useRolesStore((state) => state.changeSearch);
  const selectRole = useRolesStore((state) => state.selectRole);

  const session = useUserStore((state) => state.authSessionId);
  const query = useAdminRolesQuery(search);

  const roles = query.data?.data ?? [];
  const totalRoles = roles.length;

  const matchingRole = roles.find((role) => role.id === selectedRoleId);
  const selectedRole = matchingRole ?? roles[0];

  useEffect(() => {
    if (
      !query.isFetching &&
      selectedRole &&
      selectedRole.id !== selectedRoleId
    ) {
      selectRole(selectedRole.id);
    }
  }, [selectedRole, selectedRoleId, selectRole, query.isFetching]);

  useEffect(() => () => useRolesStore.getState().reset(), []);

  function handleSearchChange(event: ChangeEvent<HTMLInputElement>): void {
    changeSearch(event.currentTarget.value);
  }

  return (
    <div className={styles.layout}>
      <AdminCard
        title="Ролі"
        icon="admin_panel_settings"
        headerRight={<span className={styles.badge}>{totalRoles}</span>}
      >
        <div className={styles.search}>
          <input
            type="search"
            className={styles.input}
            aria-label="Пошук ролі"
            placeholder="Пошук за назвою…"
            value={search}
            onChange={handleSearchChange}
          />
        </div>
        <RolesListContent query={query} roles={roles} />
      </AdminCard>
      <AdminCard
        title="Дозволи"
        icon="fact_check"
        headerRight={selectedRole?.name}
      >
        {selectedRole && (
          <RolePermissionsPanel
            key={`${session}:${selectedRole.id}`}
            role={selectedRole}
          />
        )}
      </AdminCard>
    </div>
  );
}
