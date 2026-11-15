import type { ReactElement } from 'react';
import { useState } from 'react';

import type { AdminRole } from '../model/admin-role.types';
import { useRolePermissionsDraft } from '../model/useRolePermissionsDraft';
import styles from './Access.module.css';

const PERMISSION_ACTIONS = new Map([
  ['view', 'Перегляд'],
  ['create', 'Створення'],
  ['update', 'Редагування'],
  ['delete', 'Видалення'],
]);

const PERMISSION_SECTIONS = new Map([
  ['permissions', 'Дозволи'],
  ['dashboard', 'Панель управління'],
  ['roles', 'Ролі'],
  ['characteristics', 'Характеристики'],
  ['orders', 'Замовлення'],
  ['users', 'Користувачі'],
]);

const SECTION_LABELS = new Map([
  ...PERMISSION_SECTIONS,
  ['books', 'Книги'],
  ['authors', 'Автори'],
  ['categories', 'Категорії'],
]);

type RolePermissionsProps = {
  readonly role: AdminRole;
};

type PermissionRowProps = {
  readonly section: string;
  readonly assigned: readonly string[];
  readonly actions: readonly string[];
  readonly onToggle: (section: string, action: string) => void;
};

function PermissionRow({ section, assigned, actions, onToggle }: PermissionRowProps): ReactElement {
  const sectionLabel = SECTION_LABELS.get(section) ?? section;
  return (
    <tr>
      <th scope="row">{sectionLabel}</th>
      {actions.map((action) => (
        <td key={action}>
          <input
            type="checkbox"
            checked={assigned.includes(action)}
            onChange={() => onToggle(section, action)}
            aria-label={`${sectionLabel}: ${PERMISSION_ACTIONS.get(action) ?? action}`}
          />
        </td>
      ))}
    </tr>
  );
}

function PermissionHeader({ actions }: { readonly actions: readonly string[] }): ReactElement {
  return (
    <thead>
      <tr>
        <th scope="col">Розділ</th>
        {actions.map((action) => (
          <th scope="col" key={action}>
            {PERMISSION_ACTIONS.get(action) ?? action}
          </th>
        ))}
      </tr>
    </thead>
  );
}

/** Показывает права выбранной роли и позволяет менять её локальный черновик. */
export default function RolePermissions({ role }: RolePermissionsProps): ReactElement {
  const { permissions, isDirty, togglePermission, resetPermissions } = useRolePermissionsDraft(role);
  const [savedPermissions, setSavedPermissions] = useState<AdminRole['permissions']>();
  const sections = [...new Set([...SECTION_LABELS.keys(), ...Object.keys(permissions)])];
  const actions = [
    ...new Set([...PERMISSION_ACTIONS.keys(), ...Object.values(permissions).flat()]),
  ];
  return (
    <div className={styles.permissionTableScroll}>
      <table className={styles.permissionTable}>
        <caption className={styles.srOnly}>Дозволи ролі {role.name}</caption>
        <PermissionHeader actions={actions} />
        <tbody>
          {sections.map((section) => (
            <PermissionRow
              key={section}
              section={section}
              assigned={permissions[section] ?? []}
              actions={actions}
              onToggle={togglePermission}
            />
          ))}
        </tbody>
      </table>
      <div className={styles.actions}>
        <button
          type="button"
          className={styles.primary}
          onClick={() => setSavedPermissions(permissions)}
        >
          Зберегти
        </button>
        <button
          type="button"
          className={styles.secondary}
          disabled={!isDirty}
          onClick={resetPermissions}
          aria-label={`Скасувати зміни дозволів ролі ${role.name}`}
        >
          Скасувати
        </button>
      </div>
      <p className={styles.notice} role="status">
        {savedPermissions === permissions
          ? 'Зміни збережено (демонстрація). '
          : isDirty ? 'Є незбережені зміни. ' : ''}
        Зміни галочок діють лише на цій сторінці та скидаються після її перезавантаження.
      </p>
    </div>
  );
}
