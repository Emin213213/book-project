import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBooksQuery } from '@/modules/book';
import { useAuthorsStore } from '@/modules/author';
import { useCategoriesStore } from '@/modules/category';
import { useOrdersStore } from '@/modules/order';
import AdminHeader from '@/shared/ui/admin-header/AdminHeader.tsx';
import AdminCard from '@/shared/ui/admin-card/AdminCard.tsx';
import Icon from '@/shared/ui/Icon.tsx';
import styles from './DashboardPage.module.css';
import tableStyles from '@/shared/ui/admin-table/AdminTable.module.css';

const statusLabels: Record<string, string> = {
  pending: 'Ожидает',
  processing: 'В обработке',
  completed: 'Выполнен',
  cancelled: 'Отменён',
};

const statusColors: Record<string, string> = {
  pending: '#F59E0B',
  processing: '#6366F1',
  completed: '#10B981',
  cancelled: '#EF4444',
};

export default function DashboardPage() {
  const booksQuery = useBooksQuery({ limit: 5 });
  const books = booksQuery.books;
  const total = booksQuery.total;
  const { authors, fetchAuthors } = useAuthorsStore();
  const { categories, fetchCategories } = useCategoriesStore();
  const { orders, fetchOrders } = useOrdersStore();

  useEffect(() => {
    fetchAuthors();
    fetchCategories();
    fetchOrders();
  }, [fetchAuthors, fetchCategories, fetchOrders]);

  return (
    <>
      <AdminHeader title="Панель управления">
        <div className={styles.user}>
          <Icon name="account_circle" />
          Администратор
        </div>
      </AdminHeader>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconBooks}`}>
            <Icon name="menu_book" />
          </div>
          <div>
            <div className={styles.statValue}>{total}</div>
            <div className={styles.statLabel}>Книг</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconCategories}`}>
            <Icon name="category" />
          </div>
          <div>
            <div className={styles.statValue}>{categories.length}</div>
            <div className={styles.statLabel}>Категорий</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconAuthors}`}>
            <Icon name="people_outline" />
          </div>
          <div>
            <div className={styles.statValue}>{authors.length}</div>
            <div className={styles.statLabel}>Авторов</div>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={`${styles.statIcon} ${styles.statIconOrders}`}>
            <Icon name="receipt_long" />
          </div>
          <div>
            <div className={styles.statValue}>{orders.length}</div>
            <div className={styles.statLabel}>Заказов</div>
          </div>
        </div>
      </div>

      {orders.length > 0 && (
        <AdminCard
          title="Последние заказы"
          icon="receipt_long"
          headerRight={<Link to="/admin/orders" className={styles.cardLink}>Все заказы</Link>}
        >
          <div className={tableStyles.tableWrapper}>
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Клиент</th>
                  <th>Сумма</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id}>
                    <td className={tableStyles.textMuted}>#{order.id}</td>
                    <td><strong>{order.customerName}</strong></td>
                    <td>{order.total} &#8372;</td>
                    <td>
                      <span
                        className={styles.statusBadge}
                        style={{ background: `${statusColors[order.status]}15`, color: statusColors[order.status] }}
                      >
                        {statusLabels[order.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminCard>
      )}

      <AdminCard
        title="Последние книги"
        icon="schedule"
        headerRight={<Link to="/admin/books" className={styles.cardLink}>Все книги</Link>}
      >
        <div className={tableStyles.tableWrapper}>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>Обложка</th>
                <th>Название</th>
                <th>Автор</th>
                <th>Категория</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.id}>
                  <td>
                    <div className={tableStyles.tableCover}>
                      <img src={book.coverUrl} alt="" />
                    </div>
                  </td>
                  <td><strong>{book.title}</strong></td>
                  <td>{book.author}</td>
                  <td><span className={tableStyles.categoryBadge}>{book.category}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>

      <div className={styles.quickActions}>
        <Link to="/admin/books/add" className={styles.quickAction}>
          <Icon name="add_circle_outline" />
          Добавить книгу
        </Link>
        <Link to="/admin/categories" className={styles.quickAction}>
          <Icon name="category" />
          Управление категориями
        </Link>
        <Link to="/admin/orders" className={styles.quickAction}>
          <Icon name="receipt_long" />
          Управление заказами
        </Link>
      </div>
    </>
  );
}
