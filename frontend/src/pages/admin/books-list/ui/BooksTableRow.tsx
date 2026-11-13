
import type { AdminBook } from '@/modules/book';
import tableStyles from '@/shared/ui/admin-table/AdminTable.module.css';
import Icon from '@/shared/ui/Icon.tsx';

import styles from './BooksListPage.module.css';

interface BooksTableRowProps {
  book: AdminBook;
}

export function BooksTableRow({ book }: BooksTableRowProps): React.JSX.Element {
  return (
    <tr>
      <td>
        {book.cover && (
          <div className={tableStyles.tableCover}>
            <img src={book.cover} alt={book.title} />
          </div>
        )}
      </td>
      <td>
        <Link to={`/admin/books/${book.slug}/edit`}>
          <strong>{book.title}</strong>
        </Link>
      </td>
      <td>{book.authors.map(author => `${author.firstName} ${author.lastName}`).join(', ')}</td>
      <td>
        <span className={tableStyles.categoryBadge}>{book.category.title}</span>
      </td>
      <td>{book.price} ₴</td>
      <td>
        <span className={styles.stockNum}>{book.realQuantity} шт.</span>
      </td>
      <td>
        <div className={tableStyles.tableActions}>
          <button type="button" className={tableStyles.btnTable} title="Просмотреть">
            <Icon name="visibility" />
          </button>
          <button
            type="button"
            className={`${tableStyles.btnTable} ${tableStyles.btnEdit}`}
            title="Редактировать"
          >
            <Icon name="edit" />
          </button>
          <button
            type="button"
            className={`${tableStyles.btnTable} ${tableStyles.btnDelete}`}
            title="Удалить"
          >
            <Icon name="delete_outline" />
          </button>
        </div>
      </td>
    </tr>
  );
}
import { Link } from 'react-router-dom';
