import type { ReactNode } from 'react';
import styles from './AdminHeader.module.css';

interface AdminHeaderProps {
  title: string;
  children?: ReactNode;
}

export default function AdminHeader({ title, children }: AdminHeaderProps) {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
      {children}
    </header>
  );
}
