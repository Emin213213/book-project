import type { ReactNode } from 'react';
import styles from './BookGrid.module.css';

interface BookGridProps {
  children: ReactNode;
}

export default function BookGrid({ children }: BookGridProps) {
  return <div className={styles.grid}>{children}</div>;
}
