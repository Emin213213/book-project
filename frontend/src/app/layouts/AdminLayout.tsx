import { NavLink, Outlet } from 'react-router-dom';
import styles from './AdminLayout.module.css';

const navItems = [
  { to: '/admin', icon: 'dashboard', label: 'Панель управления', end: true },
  { to: '/admin/books', icon: 'menu_book', label: 'Книги' },
  { to: '/admin/books/add', icon: 'add_circle_outline', label: 'Додати книгу' },
  { to: '/admin/categories', icon: 'category', label: 'Категорії' },
  { to: '/admin/authors', icon: 'people_outline', label: 'Автори' },
  { to: '/admin/orders', icon: 'receipt_long', label: 'Замовлення' },
  { to: '/admin/discounts', icon: 'local_offer', label: 'Знижки' },
  { to: '/admin/suppliers', icon: 'business', label: 'Постачальники' },
  { to: '/admin/suppliers/orders', icon: 'shopping_bag', label: 'Замовлення пост.' },
  { to: '/admin/fulfillment', icon: 'local_shipping', label: 'Відправки' },
  { to: '/admin/managers', icon: 'groups', label: 'Менеджери' },
  { to: '/admin/roles', icon: 'admin_panel_settings', label: 'Ролі та дозволи' },
  { to: '/admin/settings', icon: 'settings', label: 'Налаштування' },
];

export default function AdminLayout() {
  return (
    <div className={styles.adminBody}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <span className={styles.sidebarLogo}>B</span>
          <span className={styles.sidebarBrand}>
            BookApp <span className={styles.sidebarTag}>Admin</span>
          </span>
        </div>
        <nav className={styles.sidebarNav}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `${styles.sidebarLink} ${isActive ? styles.sidebarLinkActive : ''}`
              }
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
      <main className={styles.adminMain}>
        <Outlet />
      </main>
    </div>
  );
}
