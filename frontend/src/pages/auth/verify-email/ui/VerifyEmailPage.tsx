import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/shared/ui/Icon.tsx';
import Loader from '@/shared/ui/Loader.tsx';
import styles from './VerifyEmailPage.module.css';
import {API_URL} from "@/shared/config/api.ts";

export default function VerifyEmailPage() {
  const [verified, setVerified] = useState(false);
  useEffect(() => {
    fetch(`${API_URL}/verification-email-token`);

    const timer = setTimeout(() => setVerified(true), 1500);
    return () => clearTimeout(timer);

  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.iconWrap}>
            <Icon name="mark_email_read" />
          </div>
          <h1 className={styles.title}>Активация аккаунта</h1>
          <p className={styles.subtitle}>
            {verified
              ? 'Ваш аккаунт активирован'
              : 'Проверяем вашу ссылку...'}
          </p>
        </div>

        {verified ? (
          <>
            <div className={styles.success}>
              <div className={styles.successIcon}>
                <Icon name="check_circle" />
              </div>
              <p className={styles.successText}>
                Поздравляем! Ваш аккаунт успешно активирован. Теперь вы можете
                войти и пользоваться всеми возможностями.
              </p>
            </div>
            <p className={styles.footer}>
              <Link to="/login" className={styles.footerLink}>Войти</Link>
            </p>
          </>
        ) : (
          <div className={styles.loading}>
            <Loader />
          </div>
        )}
      </div>
    </div>
  );
}
