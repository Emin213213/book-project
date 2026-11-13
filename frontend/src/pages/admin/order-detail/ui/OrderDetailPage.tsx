import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useOrdersStore } from '@/modules/order';
import { useBooksQuery } from '@/modules/book';
import { useManagersStore } from '@/modules/manager';
import { useReplaceRequestsStore } from '@/modules/replace-request';
import type { OrderItem, OrderStatus } from '@/modules/order';
import type { ReplaceRequest } from '@/modules/replace-request';
import AdminHeader from '@/shared/ui/admin-header/AdminHeader.tsx';
import AdminCard from '@/shared/ui/admin-card/AdminCard.tsx';
import CustomSelect from '@/shared/ui/CustomSelect.tsx';
import Modal from '@/shared/ui/Modal.tsx';
import Loader from '@/shared/ui/Loader.tsx';
import EmptyState from '@/shared/ui/EmptyState.tsx';
import Icon from '@/shared/ui/Icon.tsx';
import styles from './OrderDetailPage.module.css';
import tableStyles from '@/shared/ui/admin-table/AdminTable.module.css';

const statusOptions = [
  { value: 'pending', label: 'Очікує' },
  { value: 'processing', label: 'В обробці' },
  { value: 'packing', label: 'Пакування' },
  { value: 'shipped', label: 'Відправлено' },
  { value: 'on_hold', label: 'На паузі' },
  { value: 'completed', label: 'Виконано' },
  { value: 'cancelled', label: 'Скасовано' },
];

const statusColors: Record<OrderStatus, string> = {
  pending: '#F59E0B',
  processing: '#6366F1',
  packing: '#8B5CF6',
  shipped: '#3B82F6',
  on_hold: '#EF4444',
  completed: '#10B981',
  cancelled: '#6B7280',
};

const reqStatusLabels: Record<string, string> = {
  pending: 'Очікує підтвердження',
  approved: 'Підтверджено',
  rejected: 'Відхилено',
};

const reqStatusColors: Record<string, string> = {
  pending: '#F59E0B',
  approved: '#10B981',
  rejected: '#EF4444',
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { currentOrder: order, loading, fetchOrderById, updateStatus, updateItems, assignManager } = useOrdersStore();
  const books = useBooksQuery({ limit: 100 }).books;
  const { managers, fetchManagers } = useManagersStore();
  const { createRequest, fetchByOrderId } = useReplaceRequestsStore();

  const [editingItems, setEditingItems] = useState(false);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [replaceRequests, setReplaceRequests] = useState<ReplaceRequest[]>([]);

  // Replace request modal
  const [replaceIdx, setReplaceIdx] = useState<number | null>(null);
  const [replaceBookId, setReplaceBookId] = useState<number>(0);
  const [replaceReason, setReplaceReason] = useState('');

  useEffect(() => {
    if (id) fetchOrderById(Number(id));
    fetchManagers();
  }, [id, fetchOrderById, fetchManagers]);

  useEffect(() => {
    if (order) {
      fetchByOrderId(order.id).then((requests) => {
        setItems([...order.items]);
        setReplaceRequests(requests);
      });
    }
  }, [order, fetchByOrderId]);

  if (loading) return <Loader />;
  if (!order) return <EmptyState message="Замовлення не знайдено" />;

  const handleStatusChange = async (v: string | number) => {
    await updateStatus(order.id, v as OrderStatus);
    fetchOrderById(order.id);
  };

  const handleManagerChange = async (v: string | number) => {
    await assignManager(order.id, v === '' ? null : Number(v));
    fetchOrderById(order.id);
  };

  const handleSaveItems = async () => {
    const filtered = items.filter(i => i.quantity > 0);
    await updateItems(order.id, filtered);
    setEditingItems(false);
    fetchOrderById(order.id);
  };

  const handleRemoveItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  const handleQtyChange = (idx: number, qty: number) => {
    if (qty < 1) return;
    setItems(items.map((item, i) => i === idx ? { ...item, quantity: qty } : item));
  };

  const handleAddItem = () => {
    const existing = new Set(items.map(i => i.bookId));
    const available = books.find(b => !existing.has(b.id));
    if (available) setItems([...items, { bookId: available.id, title: available.title, price: available.price, quantity: 1 }]);
  };

  const openReplace = (idx: number) => {
    setReplaceIdx(idx);
    setReplaceBookId(0);
    setReplaceReason('');
  };

  const handleSendReplaceRequest = async () => {
    if (replaceIdx === null || !replaceBookId) return;
    const oldItem = order.items[replaceIdx];
    const newBook = books.find(b => b.id === replaceBookId);
    if (!oldItem || !newBook) return;

    await createRequest({
      orderId: order.id,
      itemIndex: replaceIdx,
      oldTitle: oldItem.title,
      oldPrice: oldItem.price,
      newBookId: newBook.id,
      newTitle: newBook.title,
      newPrice: newBook.price,
      reason: replaceReason.trim(),
    });

    setReplaceIdx(null);
    fetchByOrderId(order.id).then(setReplaceRequests);
  };

  const getRequestForItem = (idx: number): ReplaceRequest | undefined =>
    replaceRequests.find(r => r.itemIndex === idx && r.status === 'pending') ??
    replaceRequests.find(r => r.itemIndex === idx);

  const editTotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const manager = managers.find(m => m.id === order.managerId);
  const managerOptions = [
    { value: '', label: 'Не призначено' },
    ...managers.map(m => ({ value: m.id, label: m.name })),
  ];
  const bookOptions = books.filter(b => !order.items.some(i => i.bookId === b.id)).map(b => ({ value: b.id, label: `${b.title} — ${b.price} ₴` }));

  return (
    <>
      <AdminHeader title="">
        <div className={styles.breadcrumb}>
          <Link to="/admin/orders" className={styles.breadcrumbLink}>Замовлення</Link>
          <Icon name="chevron_right" className={styles.breadcrumbSep} />
          <span className={styles.breadcrumbCurrent}>Замовлення #{order.id}</span>
        </div>
      </AdminHeader>

      <div className={styles.grid}>
        <AdminCard title="Інформація про клієнта" icon="person">
          <div className={styles.infoBlock}>
            <div className={styles.infoRow}><span className={styles.infoLabel}>Ім'я</span><span>{order.customerName}</span></div>
            <div className={styles.infoRow}><span className={styles.infoLabel}>Email</span><span>{order.customerEmail}</span></div>
            {order.customerPhone && <div className={styles.infoRow}><span className={styles.infoLabel}>Телефон</span><span>{order.customerPhone}</span></div>}
            <div className={styles.infoRow}><span className={styles.infoLabel}>Дата</span><span>{new Date(order.createdAt).toLocaleString('uk-UA')}</span></div>
            <div className={styles.infoRow}><span className={styles.infoLabel}>Менеджер</span><span>{manager ? manager.name : <em style={{ color: 'var(--text-muted)' }}>не призначено</em>}</span></div>
          </div>
        </AdminCard>

        <AdminCard title="Управління" icon="tune">
          <div className={styles.statusBlock}>
            <div>
              <div className={styles.controlLabel}>Статус</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className={styles.statusBadge} style={{ background: `${statusColors[order.status]}15`, color: statusColors[order.status] }}>
                  {statusOptions.find(s => s.value === order.status)?.label}
                </span>
                <div className={styles.statusSelect}>
                  <CustomSelect options={statusOptions} value={order.status} onChange={handleStatusChange} size="compact" />
                </div>
              </div>
            </div>
            <div>
              <div className={styles.controlLabel}>Менеджер</div>
              <div style={{ maxWidth: 220 }}>
                <CustomSelect options={managerOptions} value={order.managerId ?? ''} onChange={handleManagerChange} placeholder="Призначити..." size="compact" />
              </div>
            </div>
          </div>
        </AdminCard>
      </div>

      <AdminCard
        title={`Товари (${order.items.length})`}
        icon="shopping_bag"
        headerRight={
          !editingItems ? (
            <button className={styles.editItemsBtn} onClick={() => setEditingItems(true)}>
              <Icon name="edit" /> Редагувати
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <button className={styles.cancelBtn} onClick={() => { setEditingItems(false); setItems([...order.items]); }}>Скасувати</button>
              <button className={styles.saveBtn} onClick={handleSaveItems}><Icon name="save" /> Зберегти</button>
            </div>
          )
        }
      >
        <div className={tableStyles.tableWrapper}>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>Назва</th>
                <th>Ціна</th>
                <th>К-сть</th>
                <th>Сума</th>
                <th>Заміна</th>
                {editingItems && <th>Дії</th>}
              </tr>
            </thead>
            <tbody>
              {(editingItems ? items : order.items).map((item, i) => {
                const req = getRequestForItem(i);
                return (
                  <tr key={i}>
                    <td><strong>{item.title}</strong></td>
                    <td>{item.price} ₴</td>
                    <td>
                      {editingItems ? (
                        <div className={styles.qtyControl}>
                          <button className={styles.qtyBtn} onClick={() => handleQtyChange(i, item.quantity - 1)}><Icon name="remove" /></button>
                          <span className={styles.qtyValue}>{item.quantity}</span>
                          <button className={styles.qtyBtn} onClick={() => handleQtyChange(i, item.quantity + 1)}><Icon name="add" /></button>
                        </div>
                      ) : item.quantity}
                    </td>
                    <td><strong>{item.price * item.quantity} ₴</strong></td>
                    <td>
                      {req ? (
                        <div className={styles.reqBadgeWrap}>
                          <span className={styles.reqBadge} style={{ background: `${reqStatusColors[req.status]}12`, color: reqStatusColors[req.status] }}>
                            <Icon name={req.status === 'pending' ? 'hourglass_empty' : req.status === 'approved' ? 'check_circle' : 'cancel'} />
                            {reqStatusLabels[req.status]}
                          </span>
                          {req.status === 'pending' && (
                            <span className={styles.reqDetail}>→ {req.newTitle} ({req.newPrice} ₴)</span>
                          )}
                        </div>
                      ) : (
                        <button className={styles.replaceBtn} onClick={() => openReplace(i)} title="Запросити заміну">
                          <Icon name="swap_horiz" /> Запросити заміну
                        </button>
                      )}
                    </td>
                    {editingItems && (
                      <td>
                        <div className={tableStyles.tableActions}>
                          <button className={`${tableStyles.btnTable} ${tableStyles.btnDelete}`} onClick={() => handleRemoveItem(i)}>
                            <Icon name="delete_outline" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {editingItems && (
          <div className={styles.addItemRow}>
            <button className={styles.addItemBtn} onClick={handleAddItem}><Icon name="add" /> Додати товар</button>
          </div>
        )}

        <div className={styles.orderTotal}>
          Разом: <strong>{editingItems ? editTotal : order.total} ₴</strong>
        </div>
      </AdminCard>

      {/* Replace request modal */}
      <Modal isOpen={replaceIdx !== null} onClose={() => setReplaceIdx(null)} title="Запит на заміну товару">
        {replaceIdx !== null && order.items[replaceIdx] && (
          <div className={styles.replaceModal}>
            <div className={styles.replaceOld}>
              <div className={styles.replaceLabel}>Поточний товар</div>
              <div className={styles.replaceItem}>
                <strong>{order.items[replaceIdx].title}</strong>
                <span>{order.items[replaceIdx].price} ₴</span>
              </div>
            </div>

            <div className={styles.replaceArrow}><Icon name="arrow_downward" /></div>

            <div className={styles.replaceNew}>
              <div className={styles.replaceLabel}>Замінити на</div>
              <CustomSelect
                options={bookOptions}
                value={replaceBookId}
                onChange={(v) => setReplaceBookId(Number(v))}
                placeholder="Оберіть книгу..."
              />
            </div>

            <div className={styles.group}>
              <label className={styles.replaceLabel}>Причина заміни</label>
              <textarea
                className={styles.textarea}
                rows={3}
                placeholder="Товар закінчився на складі, пропонуємо аналог..."
                value={replaceReason}
                onChange={e => setReplaceReason(e.target.value)}
              />
            </div>

            <div className={styles.replaceNote}>
              <Icon name="info" />
              <span>Клієнт отримає запит і зможе підтвердити або відхилити заміну</span>
            </div>

            <div className={styles.replaceActions}>
              <button className={styles.cancelBtn} onClick={() => setReplaceIdx(null)}>Скасувати</button>
              <button
                className={styles.sendReqBtn}
                onClick={handleSendReplaceRequest}
                disabled={!replaceBookId}
              >
                <Icon name="send" /> Надіслати запит
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
