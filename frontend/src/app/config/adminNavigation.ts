import { ACCESS_PERMISSION } from "@/modules/access";
import type { AccessPermission } from "@/modules/access";
import type { AdminSidebarItem } from "../layouts/AdminSidebar";

type AdminNavigationItem = AdminSidebarItem & {
  readonly permission?: AccessPermission;
};

/** Сопоставляет пункты административной навигации с требуемыми разрешениями. */
export const ADMIN_NAVIGATION: readonly AdminNavigationItem[] = [
  { to: "/admin", icon: "dashboard", label: "Панель управления", end: true },
  { to: "/admin/books", icon: "menu_book", label: "Книги" },
  { to: "/admin/books/add", icon: "add_circle_outline", label: "Додати книгу" },
  { to: "/admin/categories", icon: "category", label: "Категорії" },
  { to: "/admin/authors", icon: "people_outline", label: "Автори" },
  { to: "/admin/orders", icon: "receipt_long", label: "Замовлення" },
  { to: "/admin/discounts", icon: "local_offer", label: "Знижки" },
  { to: "/admin/suppliers", icon: "business", label: "Постачальники" },
  {
    to: "/admin/suppliers/orders",
    icon: "shopping_bag",
    label: "Замовлення пост.",
  },
  { to: "/admin/fulfillment", icon: "local_shipping", label: "Відправки" },
  { to: "/admin/managers", icon: "groups", label: "Менеджери" },
  {
    to: "/admin/roles",
    icon: "admin_panel_settings",
    label: "Ролі та дозволи",
    permission: ACCESS_PERMISSION.VIEW_ROLES,
  },
  { to: "/admin/settings", icon: "settings", label: "Налаштування" },
];
