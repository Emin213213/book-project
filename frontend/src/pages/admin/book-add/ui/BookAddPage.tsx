import { Link, useNavigate } from 'react-router-dom';
import { BookForm, useAdminBookReferencesQuery, useCreateBookMutation } from '@/modules/book';
import AdminHeader from '@/shared/ui/admin-header/AdminHeader.tsx';
import AdminCard from '@/shared/ui/admin-card/AdminCard.tsx';
import Icon from '@/shared/ui/Icon.tsx';
import styles from './BookAddPage.module.css';

export default function BookAddPage() {
  const navigate = useNavigate();
  const createBook = useCreateBookMutation();
  const referencesQuery = useAdminBookReferencesQuery();

  return (
    <>
      <AdminHeader title="">
        <div className={styles.breadcrumb}>
          <Link to="/admin/books" className={styles.breadcrumbLink}>Все книги</Link>
          <Icon name="chevron_right" className={styles.breadcrumbSep} />
          <span className={styles.breadcrumbCurrent}>Добавить книгу</span>
        </div>
      </AdminHeader>

      <AdminCard title="Добавить книгу" icon="add_circle_outline">
        <BookForm
          authors={referencesQuery.data.authors.map(author => ({
            id: author.id,
            name: `${author.firstName} ${author.lastName}`,
          }))}
          categories={referencesQuery.data.categories.map(category => ({
            id: String(category.id),
            name: category.title,
          }))}
          isSubmitting={createBook.isPending}
          onSubmit={async (data) => {
            await createBook.mutateAsync(data);
            navigate('/admin/books');
          }}
        />
      </AdminCard>
    </>
  );
}
