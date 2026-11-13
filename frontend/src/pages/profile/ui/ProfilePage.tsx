import { useEffect, useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { useUserStore } from '@/modules/user';
import { useReplaceRequestsStore } from '@/modules/replace-request';
import { useStockSubscriptionsStore } from '@/modules/stock-subscription';
import { getOrdersByUserId } from '@/modules/order';
import { useAllBooksQuery } from '@/modules/book';
import type { Book } from '@/modules/book';
import type { Order } from '@/modules/order';
import type { ReplaceRequest } from '@/modules/replace-request';
import PhotoUpload from '@/shared/ui/PhotoUpload.tsx';
import Icon from '@/shared/ui/Icon.tsx';
import styles from './ProfilePage.module.css';

type Tab = 'profile' | 'orders' | 'requests' | 'subscriptions' | 'settings';

const statusLabels: Record<string, string> = {
  pending: 'Очікує',
  processing: 'В обробці',
  completed: 'Виконано',
  cancelled: 'Скасовано',
};

const statusColors: Record<string, string> = {
  pending: '#F59E0B',
  processing: '#6366F1',
  completed: '#10B981',
  cancelled: '#EF4444',
};

export default function ProfilePage() {
  const { user, isAuth, updateProfile, changePassword, error, clearError } = useUserStore();
  const { requests, fetchRequests, updateStatus: updateReqStatus } = useReplaceRequestsStore();
  const { subscriptions, unsubscribe } = useStockSubscriptionsStore();
  const [tab, setTab] = useState<Tab>('profile');
  const [orders, setOrders] = useState<Order[]>([]);
  const { books: allBooks } = useAllBooksQuery();

  // Profile form
  const [name, setName] = useState(() => user?.name ?? '');
  const [email, setEmail] = useState(() => user?.email ?? '');
  const [phone, setPhone] = useState(() => user?.phone ?? '');
  const [avatar, setAvatar] = useState<string | null>(() => user?.avatar ?? null);
  const [saved, setSaved] = useState(false);

  // Password form
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passMsg, setPassMsg] = useState('');

  useEffect(() => {
    if (user && tab === 'orders') {
      getOrdersByUserId(user.id).then(setOrders);
    }
    if (tab === 'requests') {
      fetchRequests();
    }
  }, [user, tab, fetchRequests]);

  // Filter requests for this user's orders
  const userOrderIds = new Set(orders.map(o => o.id));
  // We need orders loaded for requests tab
  useEffect(() => {
    if (user && tab === 'requests') {
      getOrdersByUserId(user.id).then(setOrders);
    }
   
  }, [user, tab]);

  if (!isAuth) return <Navigate to="/login" replace />;

  const userRequests = requests.filter(r => {
    // Show all requests related to user's orders
    return orders.some(o => o.id === r.orderId) || userOrderIds.has(r.orderId);
  });

  const pendingReqCount = userRequests.filter(r => r.status === 'pending').length;

  const handleProfileSave = async (e: FormEvent) => {
    e.preventDefault();
    await updateProfile({ name: name.trim(), email: email.trim(), phone: phone.trim(), avatar });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePasswordChange = async (e: FormEvent) => {
    e.preventDefault();
    if (newPass !== confirmPass) { setPassMsg('Паролі не збігаються'); return; }
    if (newPass.length < 6) { setPassMsg('Мінімум 6 символів'); return; }
    clearError();
    const ok = await changePassword(oldPass, newPass);
    if (ok) {
      setPassMsg('Пароль змінено');
      setOldPass(''); setNewPass(''); setConfirmPass('');
    } else {
      setPassMsg('');
    }
  };

  const handleApproveRequest = async (req: ReplaceRequest) => {
    await updateReqStatus(req.id, 'approved');
    fetchRequests();
  };

  const handleRejectRequest = async (req: ReplaceRequest) => {
    await updateReqStatus(req.id, 'rejected');
    fetchRequests();
  };

  const tabs: { key: Tab; icon: string; label: string; badge?: number }[] = [
    { key: 'profile', icon: 'person', label: 'Профіль' },
    { key: 'orders', icon: 'receipt_long', label: 'Мої замовлення' },
    { key: 'requests', icon: 'swap_horiz', label: 'Заміни', badge: pendingReqCount },
    { key: 'subscriptions', icon: 'notifications', label: 'Підписки', badge: subscriptions.length },
    { key: 'settings', icon: 'settings', label: 'Налаштування' },
  ];

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarUser}>
          {avatar ? (
            <img src={avatar} alt="" className={styles.sidebarAvatar} />
          ) : (
            <div className={styles.sidebarAvatarFallback}>
              {user!.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()}
            </div>
          )}
          <div className={styles.sidebarName}>{user!.name}</div>
          <div className={styles.sidebarEmail}>{user!.email}</div>
        </div>
        <nav className={styles.sidebarNav}>
          {tabs.map(t => (
            <button
              key={t.key}
              className={`${styles.sidebarLink} ${tab === t.key ? styles.sidebarLinkActive : ''}`}
              onClick={() => setTab(t.key)}
            >
              <Icon name={t.icon} />
              {t.label}
              {t.badge && t.badge > 0 ? <span className={styles.sidebarBadge}>{t.badge}</span> : null}
            </button>
          ))}
        </nav>
      </aside>

      <div className={styles.content}>
        {tab === 'profile' && (
          <>
            <h2 className={styles.sectionTitle}>Редагування профілю</h2>
            <form className={styles.form} onSubmit={handleProfileSave}>
              <div className={styles.group}>
                <label className={styles.label}>Фото профілю</label>
                <PhotoUpload value={avatar} onChange={setAvatar} />
              </div>
              <div className={styles.formGrid}>
                <div className={styles.group}>
                  <label className={styles.label}>Ім'я</label>
                  <input className={styles.input} type="text" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div className={styles.group}>
                  <label className={styles.label}>Email</label>
                  <input className={styles.input} type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className={styles.group}>
                  <label className={styles.label}>Телефон</label>
                  <input className={styles.input} type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+380 (XX) XXX-XX-XX" />
                </div>
              </div>
              <div className={styles.formActions}>
                {saved && <span className={styles.savedMsg}><Icon name="check_circle" /> Збережено</span>}
                <button type="submit" className={styles.btnPrimary}><Icon name="save" /> Зберегти</button>
              </div>
            </form>
          </>
        )}

        {tab === 'orders' && (
          <>
            <h2 className={styles.sectionTitle}>Історія замовлень</h2>
            {orders.length === 0 ? (
              <div className={styles.emptyOrders}>
                <Icon name="receipt_long" />
                <p>У вас поки немає замовлень</p>
              </div>
            ) : (
              <div className={styles.ordersList}>
                {orders.map(order => (
                  <div key={order.id} className={styles.orderCard}>
                    <div className={styles.orderHeader}>
                      <span className={styles.orderId}>Замовлення #{order.id}</span>
                      <span className={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString('uk-UA')}</span>
                      <span className={styles.orderStatus} style={{ background: `${statusColors[order.status]}15`, color: statusColors[order.status] }}>
                        {statusLabels[order.status]}
                      </span>
                    </div>
                    <div className={styles.orderItems}>
                      {order.items.map((item, i) => (
                        <div key={i} className={styles.orderItem}>
                          <span>{item.title}</span>
                          <span className={styles.orderItemQty}>{item.quantity} x {item.price} ₴</span>
                        </div>
                      ))}
                    </div>
                    <div className={styles.orderTotal}>Разом: <strong>{order.total} ₴</strong></div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'requests' && (
          <>
            <h2 className={styles.sectionTitle}>Запити на заміну товарів</h2>
            {userRequests.length === 0 ? (
              <div className={styles.emptyOrders}>
                <Icon name="swap_horiz" />
                <p>Запитів на заміну немає</p>
              </div>
            ) : (
              <div className={styles.requestsList}>
                {userRequests.map(req => (
                  <div key={req.id} className={`${styles.requestCard} ${req.status === 'pending' ? styles.requestCardPending : ''}`}>
                    <div className={styles.requestHeader}>
                      <span className={styles.requestOrderId}>Замовлення #{req.orderId}</span>
                      <span className={styles.requestDate}>{new Date(req.createdAt).toLocaleDateString('uk-UA')}</span>
                      <span
                        className={styles.requestStatus}
                        style={{ background: `${statusColors[req.status] || '#6B7280'}15`, color: statusColors[req.status] || '#6B7280' }}
                      >
                        {req.status === 'pending' ? 'Очікує відповіді' : req.status === 'approved' ? 'Підтверджено' : 'Відхилено'}
                      </span>
                    </div>

                    <div className={styles.requestBody}>
                      <div className={styles.requestSwap}>
                        <div className={styles.requestItem}>
                          <span className={styles.requestItemLabel}>Було:</span>
                          <strong>{req.oldTitle}</strong>
                          <span className={styles.requestPrice}>{req.oldPrice} ₴</span>
                        </div>
                        <div className={styles.requestArrow}><Icon name="arrow_forward" /></div>
                        <div className={styles.requestItem}>
                          <span className={styles.requestItemLabel}>Пропонують:</span>
                          <strong>{req.newTitle}</strong>
                          <span className={styles.requestPrice}>{req.newPrice} ₴</span>
                        </div>
                      </div>
                      {req.reason && <p className={styles.requestReason}><Icon name="comment" /> {req.reason}</p>}
                    </div>

                    {req.status === 'pending' && (
                      <div className={styles.requestActions}>
                        <button className={styles.rejectBtn} onClick={() => handleRejectRequest(req)}>
                          <Icon name="close" /> Відхилити
                        </button>
                        <button className={styles.approveBtn} onClick={() => handleApproveRequest(req)}>
                          <Icon name="check" /> Підтвердити заміну
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'subscriptions' && (() => {
          const subBooks = subscriptions
            .map(s => allBooks.find(b => b.id === s.bookId))
            .filter(Boolean) as Book[];
          return (
            <>
              <h2 className={styles.sectionTitle}>Підписки на наявність</h2>
              {subBooks.length === 0 ? (
                <div className={styles.emptyOrders}>
                  <Icon name="notifications_none" />
                  <p>Ви поки не підписані на жодну книгу</p>
                </div>
              ) : (
                <div className={styles.subsList}>
                  {subBooks.map(book => (
                    <div key={book.id} className={styles.subCard}>
                      <img src={book.coverUrl} alt="" className={styles.subCover} />
                      <div className={styles.subInfo}>
                        <span className={styles.subTitle}>{book.title}</span>
                        <span className={styles.subAuthor}>{book.author}</span>
                        <span className={styles.subPrice}>{book.price} ₴</span>
                      </div>
                      <div className={styles.subStatus}>
                        {book.stock > 0 ? (
                          <span className={styles.subInStock}>
                            <Icon name="check_circle" /> В наявності!
                          </span>
                        ) : (
                          <span className={styles.subOutStock}>
                            <Icon name="hourglass_empty" /> Очікується
                          </span>
                        )}
                      </div>
                      <button
                        className={styles.subUnsubBtn}
                        onClick={() => unsubscribe(book.id)}
                        title="Відписатися"
                      >
                        <Icon name="notifications_off" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          );
        })()}

        {tab === 'settings' && (
          <>
            <h2 className={styles.sectionTitle}>Зміна пароля</h2>
            <form className={styles.form} onSubmit={handlePasswordChange}>
              {(error || passMsg) && (
                <div className={passMsg === 'Пароль змінено' ? styles.success : styles.errorMsg}>
                  <Icon name={passMsg === 'Пароль змінено' ? 'check_circle' : 'error_outline'} />
                  {error || passMsg}
                </div>
              )}
              <div className={styles.group}>
                <label className={styles.label}>Поточний пароль</label>
                <input className={styles.input} type="password" value={oldPass} onChange={e => setOldPass(e.target.value)} required />
              </div>
              <div className={styles.group}>
                <label className={styles.label}>Новий пароль</label>
                <input className={styles.input} type="password" value={newPass} onChange={e => setNewPass(e.target.value)} required minLength={6} />
              </div>
              <div className={styles.group}>
                <label className={styles.label}>Підтвердіть новий пароль</label>
                <input className={styles.input} type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} required />
              </div>
              <div className={styles.formActions}>
                <button type="submit" className={styles.btnPrimary}><Icon name="lock" /> Змінити пароль</button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
