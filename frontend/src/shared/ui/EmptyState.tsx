import Icon from './Icon.tsx';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  icon?: string;
  message: string;
}

export default function EmptyState({ icon = 'menu_book', message }: EmptyStateProps) {
  return (
    <div className={styles.empty}>
      <Icon name={icon} className={styles.icon} />
      <span>{message}</span>
    </div>
  );
}
