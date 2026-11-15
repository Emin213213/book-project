import type { ReactElement } from "react";
import { NavLink } from "react-router-dom";
import type { NavLinkRenderProps } from "react-router-dom";

import styles from "./AdminLayout.module.css";

/** Пункт навигации без знаний о разрешениях пользователя. */
export type AdminSidebarItem = {
  readonly to: string;
  readonly icon: string;
  readonly label: string;
  readonly end?: boolean;
};

type AdminSidebarProps = {
  readonly items: readonly AdminSidebarItem[];
};

function getLinkClassName({ isActive }: NavLinkRenderProps): string {
  return `${styles.sidebarLink} ${isActive ? styles.sidebarLinkActive : ""}`;
}

/** Отображает уже разрешённые пункты меню; доступ проверяет сборка приложения. */
export default function AdminSidebar({
  items,
}: AdminSidebarProps): ReactElement {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <span className={styles.sidebarLogo}>B</span>
        <span className={styles.sidebarBrand}>
          BookApp <span className={styles.sidebarTag}>Admin</span>
        </span>
      </div>
      <nav className={styles.sidebarNav}>
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={getLinkClassName}
          >
            <span className="material-icons-outlined">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className={styles.sidebarFooter}>
        <NavLink to="/" className={styles.sidebarLink}>
          <span className="material-icons-outlined">open_in_new</span>
          <span>Перейти на сайт</span>
        </NavLink>
      </div>
    </aside>
  );
}
