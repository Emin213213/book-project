import type { ReactElement } from 'react';

import type { AdminRole } from '../model/admin-role.types';
import styles from './Access.module.css';

type RoleListItemProps = {
  readonly role: AdminRole;
  readonly selected: boolean;
  readonly onSelect: () => void;
};

/** Позволяет выбрать роль для просмотра разрешений. */
export default function RoleListItem({
  role,
  selected,
  onSelect,
}: RoleListItemProps): ReactElement {
  return (
    <button
      type="button"
      className={`${styles.roleItem} ${selected ? styles.active : ''}`}
      aria-pressed={selected}
      onClick={onSelect}
    >
      <span>
        <strong>{role.name}</strong>
        <small>
          {role.slug}
          {role.is_system ? ' · Системна роль' : ''}
        </small>
      </span>
    </button>
  );
}
