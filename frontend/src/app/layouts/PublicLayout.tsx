import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useFavoritesStore } from '@/modules/favorite';
import { useCartStore } from '@/modules/cart';
import { useUserStore } from '@/modules/user';
import styles from './PublicLayout.module.css';
import  {Toaster} from "react-hot-toast";

export default function PublicLayout() {
  const navigate = useNavigate();
  const favCount = useFavoritesStore((s) => s.ids.length);
  const cartCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const { user, isAuth, logout } = useUserStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const initials = user?.name?.split(' ')
      .map(w => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();



  return (
    <>
      <Toaster
          position="top-left"
          reverseOrder={false}
      />
      <nav className={styles.navbar}>
        <NavLink to="/" className={styles.logo}>B</NavLink>
        <div className={styles.links}>
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.linkActive : ''}`
            }
          >
            <span className="material-icons-outlined">search</span>
            <span>Поиск книг</span>
          </NavLink>
          <NavLink
            to="/favorites"
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.linkActive : ''}`
            }
          >
            <span className="material-icons-outlined">bookmark_border</span>
            <span>Избранное</span>
            {favCount > 0 && <span className={styles.badge}>{favCount}</span>}
          </NavLink>
          <NavLink
            to="/cart"
            className={({ isActive }) =>
              `${styles.link} ${isActive ? styles.linkActive : ''}`
            }
          >
            <span className="material-icons-outlined">shopping_cart</span>
            <span>Корзина</span>
            {cartCount > 0 && <span className={styles.badgeCart}>{cartCount}</span>}
          </NavLink>

          {isAuth && user ? (
            <div className={styles.userMenu} ref={menuRef}>
              <button className={styles.userBtn} onClick={() => setMenuOpen(!menuOpen)}>
                {user.avatar ? (
                  <img src={user.avatar} alt="" className={styles.userAvatar} />
                ) : (
                  <span className={styles.userInitials}>{initials}</span>
                )}
              </button>
              {menuOpen && (
                <div className={styles.dropdown}>
                  <div className={styles.dropdownHeader}>
                    <span className={styles.dropdownName}>{user.name}</span>
                    <span className={styles.dropdownEmail}>{user.email}</span>
                  </div>
                  <button className={styles.dropdownItem} onClick={() => { setMenuOpen(false); navigate('/profile'); }}>
                    <span className="material-icons-outlined">person</span>
                    Профиль
                  </button>
                  <button className={styles.dropdownItem} onClick={() => { setMenuOpen(false); navigate('/profile'); }}>
                    <span className="material-icons-outlined">receipt_long</span>
                    Мои заказы
                  </button>
                  <div className={styles.dropdownDivider} />
                  <button className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`} onClick={() => { setMenuOpen(false); logout(); }}>
                    <span className="material-icons-outlined">logout</span>
                    Выйти
                  </button>
                </div>
              )}
            </div>
          ) : (
            <NavLink
              to="/login"
              className={({ isActive }) =>
                `${styles.link} ${isActive ? styles.linkActive : ''}`
              }
            >
              <span className="material-icons-outlined">person_outline</span>
              <span>Войти</span>
            </NavLink>
          )}
        </div>
      </nav>
      <main className={styles.container}>
        <Outlet />
      </main>
    </>
  );
}