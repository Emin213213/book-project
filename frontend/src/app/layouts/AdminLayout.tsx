import type { ReactElement } from "react";
import { Outlet } from "react-router-dom";

import { useAccess } from "@/modules/access";
import { ADMIN_NAVIGATION } from "../config/adminNavigation";
import AdminSidebar from "./AdminSidebar";
import styles from "./AdminLayout.module.css";

/** Проверяет доступ к пунктам меню и собирает административную часть приложения. */
export default function AdminLayout(): ReactElement {
  const { canAccess } = useAccess();
  const visibleItems = ADMIN_NAVIGATION.filter(
    (item) => item.permission === undefined || canAccess(item.permission),
  );

  return (
    <div className={styles.adminBody}>
      <AdminSidebar items={visibleItems} />
      <main className={styles.adminMain}>
        <Outlet />
      </main>
    </div>
  );
}
