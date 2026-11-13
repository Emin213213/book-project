import { useState, type FormEvent } from 'react';
import {Link} from 'react-router-dom';
import Icon from '@/shared/ui/Icon.tsx';
import styles from './ForgotPasswordPage.module.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);



  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    // Разметка без логики: имитируем отправку письма
    setSent(true);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.iconWrap}>
            <Icon name="lock_reset" />
          </div>
          <h1 className={styles.title}>Восстановление пароля</h1>
          <p className={styles.subtitle}>
            {sent
              ? 'Проверьте вашу почту'
              : 'Укажите email — мы отправим ссылку для сброса пароля'}
          </p>
        </div>

        {sent ? (
          <div className={styles.success}>
            <div className={styles.successIcon}>
              <Icon name="mark_email_read" />
            </div>
            <p className={styles.successText}>
              Мы отправили письмо со ссылкой для смены пароля на
            </p>
            <p className={styles.successText}>
              <strong>{email}</strong>
            </p>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.group}>
              <label className={styles.label}>Email</label>
              <input
                className={styles.input}
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <button className={styles.submitBtn} type="submit">
              Отправить ссылку
            </button>
          </form>
        )}

        <p className={styles.footer}>
          <Link to="/login" className={styles.footerLink}>← Назад ко входу</Link>
        </p>
      </div>
    </div>
  );
}