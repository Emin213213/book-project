import { Link } from 'react-router-dom';

import { useAdminBooksQuery } from '@/modules/book';
import Icon from '@/shared/ui/Icon.tsx';
import AdminHeader from '@/shared/ui/admin-header/AdminHeader.tsx';

import { useBooksListSearch } from '../model/useBooksListSearch';
import { BooksTable } from './BooksTable';
import { BooksToolbar } from './BooksToolbar';
import styles from './BooksListPage.module.css';

export default function BooksListPage(): React.JSX.Element {
  const { search, setSearch } = useBooksListSearch();
  const { books, total, isError, isPending } = useAdminBooksQuery(search);

  return (
    <>
      <AdminHeader title="Книги">
        <Link to="/admin/books/add" className={styles.btnPrimary}>
          <Icon name="add" /> Додати книгу
        </Link>
      </AdminHeader>

      <BooksToolbar
        search={search}
        total={total}
        onSearchChange={setSearch}
      />

      <BooksTable
        books={books}
        isError={isError}
        isPending={isPending}
      />
    </>
  );
}
