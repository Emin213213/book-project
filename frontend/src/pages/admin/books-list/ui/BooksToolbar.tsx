import Icon from '@/shared/ui/Icon.tsx';

import styles from './BooksListPage.module.css';

interface BooksToolbarProps {
  search: string;
  total: number;
  onSearchChange: (search: string) => void;
}

export function BooksToolbar({
  search,
  total,
  onSearchChange,
}: BooksToolbarProps): React.JSX.Element {
  return (
    <section className={styles.toolbar}>
      <div className={styles.toolbarLeft}>
        <div className={styles.tableSearch}>
          <Icon name="search" />
          <input
            type="text"
            placeholder="Пошук за назвою..."
            value={search}
            onChange={event => onSearchChange(event.target.value)}
          />
        </div>
      </div>
      <p className={styles.toolbarCount}>
        Показано: <strong>{total}</strong> книг
      </p>
    </section>
  );
}
