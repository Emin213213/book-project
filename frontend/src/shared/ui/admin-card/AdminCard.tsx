import type { ReactNode } from 'react';
import styles from './AdminCard.module.css';

interface AdminCardProps {
  title?: string;
  icon?: string;
  headerRight?: ReactNode;
  children: ReactNode;
}

export default function AdminCard({ title, icon, headerRight, children }: AdminCardProps) {
  return (
    <section className={styles.card}>
      {title && (
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>
            {icon && <span className="material-icons-outlined">{icon}</span>}
            {title}
          </h2>
          {headerRight}
        </div>
      )}
      {children}
    </section>
  );
}
