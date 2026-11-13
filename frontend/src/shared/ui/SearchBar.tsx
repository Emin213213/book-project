import { useState, type FormEvent } from 'react';
import Icon from './Icon.tsx';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  initialValue?: string;
  onSearch: (query: string) => void;
}

export default function SearchBar({ initialValue = '', onSearch }: SearchBarProps) {
  const [value, setValue] = useState(initialValue);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSearch(value.trim());
  };

  return (
    <form className={styles.searchBar} onSubmit={handleSubmit}>
      <Icon name="search" className={styles.icon} />
      <input
        className={styles.input}
        type="text"
        placeholder="Поиск книг по названию, автору..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button className={styles.btn} type="submit">
        <Icon name="search" />
      </button>
    </form>
  );
}
