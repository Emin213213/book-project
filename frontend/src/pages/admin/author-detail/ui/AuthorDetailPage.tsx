import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getAuthorById } from '@/modules/author';
import { useAllBooksQuery } from '@/modules/book';
import type { Author } from '@/modules/author';
import AdminHeader from '@/shared/ui/admin-header/AdminHeader.tsx';
import AdminCard from '@/shared/ui/admin-card/AdminCard.tsx';
import Loader from '@/shared/ui/Loader.tsx';
import EmptyState from '@/shared/ui/EmptyState.tsx';
import Icon from '@/shared/ui/Icon.tsx';
import styles from './AuthorDetailPage.module.css';
import tableStyles from '@/shared/ui/admin-table/AdminTable.module.css';

export default function AuthorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [author, setAuthor] = useState<Author | null>(null);
  const { books: allBooks, isPending: areBooksPending } = useAllBooksQuery();
  const [loading, setLoading] = useState(true);
  const books = author ? allBooks.filter(book => book.authorId === author.id) : [];

  useEffect(() => {
    if (!id) return;
    getAuthorById(Number(id)).then(authorData => {
      setAuthor(authorData ?? null);
      setLoading(false);
    });
  }, [id]);

  if (loading || areBooksPending) return <Loader />;
  if (!author) return <EmptyState message="Автор не найден" />;

  const initials = author.name
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <>
      <AdminHeader title="">
        <div className={styles.breadcrumb}>
          <Link to="/admin/authors" className={styles.breadcrumbLink}>Авторы</Link>
          <Icon name="chevron_right" className={styles.breadcrumbSep} />
          <span className={styles.breadcrumbCurrent}>{author.name}</span>
        </div>
      </AdminHeader>

      <div className={styles.profile}>
        {author.photo ? (
          <img src={author.photo} alt={author.name} className={styles.avatar} />
        ) : (
          <div className={styles.avatarFallback}>{initials}</div>
        )}
        <div className={styles.profileInfo}>
          <h2 className={styles.profileName}>{author.name}</h2>
          <div className={styles.profileMeta}>
            {author.country && (
              <span className={styles.metaItem}>
                <Icon name="place" />
                {author.country}
              </span>
            )}
            {author.birthYear > 0 && (
              <span className={styles.metaItem}>
                <Icon name="cake" />
                {author.birthYear}
              </span>
            )}
            <span className={styles.metaItem}>
              <Icon name="menu_book" />
              {books.length} {books.length === 1 ? 'книга' : books.length < 5 ? 'книги' : 'книг'}
            </span>
          </div>
        </div>
      </div>

      <AdminCard title={`Книги автора (${books.length})`} icon="menu_book">
        {books.length === 0 ? (
          <div className={styles.empty}>
            <EmptyState icon="menu_book" message="У этого автора пока нет книг" />
          </div>
        ) : (
          <div className={tableStyles.tableWrapper}>
            <table className={tableStyles.table}>
              <thead>
                <tr>
                  <th>Обложка</th>
                  <th>Название</th>
                  <th>Категория</th>
                  <th>Год</th>
                  <th>Стр.</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {books.map(book => (
                  <tr key={book.id}>
                    <td>
                      <div className={tableStyles.tableCover}>
                        <img src={book.coverUrl} alt="" />
                      </div>
                    </td>
                    <td><strong>{book.title}</strong></td>
                    <td><span className={tableStyles.categoryBadge}>{book.category}</span></td>
                    <td>{book.year}</td>
                    <td>{book.pages}</td>
                    <td>
                      <div className={tableStyles.tableActions}>
                        <button
                          className={`${tableStyles.btnTable} ${tableStyles.btnEdit}`}
                          title="Редактировать"
                          onClick={() => navigate(`/admin/books/${book.id}/edit`)}
                        >
                          <Icon name="edit" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminCard>
    </>
  );
}
