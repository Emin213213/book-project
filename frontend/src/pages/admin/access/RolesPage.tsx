import { useState } from 'react';
import type { ReactElement } from 'react';

import RolesList from '@/modules/access/ui/RolesList';
import styles from '@/modules/access/ui/Access.module.css';
import AdminHeader from '@/shared/ui/admin-header/AdminHeader';

/** Отображает список ролей с поиском и бесконечной подгрузкой. */
export default function RolesPage(): ReactElement {
  const [search, setSearch] = useState('');
  return (
    <>
      <AdminHeader title="Ролі та дозволи" />
      <div className={styles.search}>
        <input
          type="search"
          className={styles.input}
          aria-label="Пошук ролі"
          placeholder="Пошук за назвою…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>
      <RolesList search={search} />
    </>
  );
}
