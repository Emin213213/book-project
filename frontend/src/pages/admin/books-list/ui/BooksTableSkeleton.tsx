import { SKELETON_ROW_COUNT, TABLE_COLUMN_COUNT } from '../model/booksList.constants';
import styles from './BooksListPage.module.css';

export function BooksTableSkeleton(): React.JSX.Element {
  return (
    <>
      {Array.from({ length: SKELETON_ROW_COUNT }, (_, rowIndex) => (
        <tr key={`skeleton-${rowIndex}`}>
          {Array.from({ length: TABLE_COLUMN_COUNT }, (_, columnIndex) => (
            <td key={columnIndex}>
              <span className={styles.skeleton} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
