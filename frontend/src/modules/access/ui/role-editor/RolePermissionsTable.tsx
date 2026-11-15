import type { ReactElement } from "react";

import { useRolesStore } from "../../model/useRolesStore";
import { ACCESS_ACTION, ACCESS_SUBJECT } from "../../model/access.constants";
import styles from "../Access.module.css";

const MODULE_LABELS = new Map<string, string>([
  [ACCESS_SUBJECT.ROLES, "Ролі"],
  [ACCESS_SUBJECT.PERMISSIONS, "Дозволи"],
]);

const ACTION_LABELS = new Map<string, string>([
  [ACCESS_ACTION.VIEW, "Перегляд"],
  [ACCESS_ACTION.CREATE, "Створення"],
  [ACCESS_ACTION.UPDATE, "Редагування"],
  [ACCESS_ACTION.DELETE, "Видалення"],
]);

const PERMISSION_MODULES = Object.values(ACCESS_SUBJECT);
const PERMISSION_ACTIONS = Object.values(ACCESS_ACTION);

type PermissionCheckboxProps = {
  readonly module: string;
  readonly action: string;
};

function PermissionCheckbox({
  module,
  action,
}: PermissionCheckboxProps): ReactElement {
  const checked = useRolesStore((state) =>
    (state.permissions[module] ?? []).includes(action),
  );
  const togglePermission = useRolesStore((state) => state.togglePermission);

  function handleChange(): void {
    togglePermission(module, action);
  }

  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={handleChange}
      aria-label={`${MODULE_LABELS.get(module) ?? module}: ${ACTION_LABELS.get(action) ?? action}`}
    />
  );
}

/** Показывает разрешения роли напрямую из Zustand. */
export default function RolePermissionsTable(): ReactElement {
  const name = useRolesStore((state) => state.editingRole?.name);
  return (
    <table className={styles.permissionTable}>
      <caption className={styles.srOnly}>Дозволи ролі {name}</caption>
      <thead>
        <tr>
          <th scope="col">Модуль</th>
          {PERMISSION_ACTIONS.map((action) => (
            <th scope="col" key={action}>
              {ACTION_LABELS.get(action)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {PERMISSION_MODULES.map((module) => (
          <tr key={module}>
            <th scope="row">{MODULE_LABELS.get(module) ?? module}</th>
            {PERMISSION_ACTIONS.map((action) => (
              <td key={action}>
                <PermissionCheckbox module={module} action={action} />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
