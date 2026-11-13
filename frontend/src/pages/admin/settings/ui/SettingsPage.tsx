import { useState, type FormEvent } from 'react';
import AdminHeader from '@/shared/ui/admin-header/AdminHeader.tsx';
import AdminCard from '@/shared/ui/admin-card/AdminCard.tsx';
import Icon from '@/shared/ui/Icon.tsx';
import styles from './SettingsPage.module.css';

export default function SettingsPage() {
  const [siteName, setSiteName] = useState('BookApp');
  const [siteDesc, setSiteDesc] = useState('Онлайн-магазин книг');
  const [currency, setCurrency] = useState('UAH');
  const [booksPerPage, setBooksPerPage] = useState('6');
  const [email, setEmail] = useState('admin@bookapp.ua');
  const [phone, setPhone] = useState('+380 (44) 123-45-67');
  const [address, setAddress] = useState('м. Київ, вул. Хрещатик, 1');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <>
      <AdminHeader title="Налаштування" />

      <form onSubmit={handleSave}>
        <AdminCard title="Загальні налаштування" icon="settings">
          <div className={styles.formBody}>
            <div className={styles.formGrid}>
              <div className={styles.group}>
                <label className={styles.label}>Назва сайту</label>
                <input className={styles.input} type="text" value={siteName} onChange={e => setSiteName(e.target.value)} />
              </div>
              <div className={styles.group}>
                <label className={styles.label}>Опис</label>
                <input className={styles.input} type="text" value={siteDesc} onChange={e => setSiteDesc(e.target.value)} />
              </div>
              <div className={styles.group}>
                <label className={styles.label}>Валюта</label>
                <input className={styles.input} type="text" value={currency} onChange={e => setCurrency(e.target.value)} disabled />
              </div>
              <div className={styles.group}>
                <label className={styles.label}>Книг на сторінці</label>
                <input className={styles.input} type="number" value={booksPerPage} onChange={e => setBooksPerPage(e.target.value)} min="3" max="24" />
              </div>
            </div>
          </div>
        </AdminCard>

        <AdminCard title="Контактна інформація" icon="contact_mail">
          <div className={styles.formBody}>
            <div className={styles.formGrid}>
              <div className={styles.group}>
                <label className={styles.label}>Email підтримки</label>
                <input className={styles.input} type="email" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className={styles.group}>
                <label className={styles.label}>Телефон</label>
                <input className={styles.input} type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <div className={`${styles.group} ${styles.groupFull}`}>
                <label className={styles.label}>Адреса</label>
                <input className={styles.input} type="text" value={address} onChange={e => setAddress(e.target.value)} />
              </div>
            </div>
          </div>
        </AdminCard>

        <AdminCard title="Небезпечна зона" icon="warning">
          <div className={styles.dangerBody}>
            <div className={styles.dangerItem}>
              <div>
                <div className={styles.dangerTitle}>Очистити кеш</div>
                <div className={styles.dangerDesc}>Видалити всі збережені дані з localStorage</div>
              </div>
              <button type="button" className={styles.btnDanger} onClick={() => { localStorage.clear(); window.location.reload(); }}>
                <Icon name="delete_sweep" /> Очистити
              </button>
            </div>
          </div>
        </AdminCard>

        <div className={styles.saveBar}>
          {saved && (
            <span className={styles.savedMsg}>
              <Icon name="check_circle" /> Збережено
            </span>
          )}
          <button type="submit" className={styles.btnPrimary}>
            <Icon name="save" /> Зберегти налаштування
          </button>
        </div>
      </form>
    </>
  );
}