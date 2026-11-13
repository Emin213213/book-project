import { TABLE_COLUMN_COUNT } from '../model/booksList.constants';
import styles from './BooksListPage.module.css';

interface BooksTableMessageProps {
  message: string;
}

export function BooksTableMessage({ message }: BooksTableMessageProps): React.JSX.Element {
  return (
    <tr>
      <td colSpan={TABLE_COLUMN_COUNT} className={styles.tableMessage}>
        {message}
      </td>
    </tr>
  );
}
