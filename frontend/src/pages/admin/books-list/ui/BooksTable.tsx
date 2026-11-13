import type { AdminBook } from '@/modules/book';
import tableStyles from '@/shared/ui/admin-table/AdminTable.module.css';

import { BooksTableMessage } from './BooksTableMessage';
import { BooksTableRow } from './BooksTableRow';
import { BooksTableSkeleton } from './BooksTableSkeleton';
import styles from './BooksListPage.module.css';

interface BooksTableProps {
  books: readonly AdminBook[];
  isError: boolean;
  isPending: boolean;
}

export function BooksTable({
  books,
  isError,
  isPending,
}: BooksTableProps): React.JSX.Element {
  return (
    <section className={styles.card}>
      <div className={tableStyles.tableWrapper}>
        <table className={tableStyles.table}>
          <thead>
            <tr>
              <th>Обкладинка</th>
              <th>Назва</th>
              <th>Автор</th>
              <th>Категорія</th>
              <th>Ціна</th>
              <th>Залишок</th>
              <th>Дії</th>
            </tr>
          </thead>
          <tbody>
            {isPending && <BooksTableSkeleton />}
            {!isPending && books.map(book => <BooksTableRow key={book.id} book={book} />)}
            {isError && <BooksTableMessage message="Не вдалося завантажити книги" />}
            {!isPending && !isError && books.length === 0 && (
              <BooksTableMessage message="Книг немає" />
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
