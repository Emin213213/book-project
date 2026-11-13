import { useEffect, useState, type FormEvent } from 'react';
import { useSupplierOrdersStore } from '@/modules/supplier-order';
import { useSuppliersStore } from '@/modules/supplier';
import { useBooksQuery } from '@/modules/book';
import type { SupplierOrderItem, SupplierOrderStatus } from '@/modules/supplier-order';
import { generateSupplierCSV } from '@/modules/supplier-order';
import AdminHeader from '@/shared/ui/admin-header/AdminHeader.tsx';
import AdminCard from '@/shared/ui/admin-card/AdminCard.tsx';
import CustomSelect from '@/shared/ui/CustomSelect.tsx';
import Modal from '@/shared/ui/Modal.tsx';
import Icon from '@/shared/ui/Icon.tsx';
import styles from './SupplierOrdersPage.module.css';
import tableStyles from '@/shared/ui/admin-table/AdminTable.module.css';

const statusLabels: Record<string, string> = { draft: 'Чернетка', sent: 'Відправлено', confirmed: 'Підтверджено', shipped: 'В дорозі', received: 'Отримано' };
const statusColors: Record<string, string> = { draft: '#6B7280', sent: '#3B82F6', confirmed: '#6366F1', shipped: '#F59E0B', received: '#10B981' };

export default function SupplierOrdersPage() {
  const { orders, fetchOrders, createOrder, addItem, removeItem, updateStatus } = useSupplierOrdersStore();
  const { suppliers, fetchSuppliers } = useSuppliersStore();
  const books = useBooksQuery({ limit: 100 }).books;

  const [showCreate, setShowCreate] = useState(false);
  const [supplierId, setSupplierId] = useState<number>(0);
  const [note, setNote] = useState('');
  const [newItems, setNewItems] = useState<SupplierOrderItem[]>([]);
  const [addBookId, setAddBookId] = useState<number>(0);
  const [addQty, setAddQty] = useState('10');
  const [addPrice, setAddPrice] = useState('');

  // Add to existing order
  const [addToOrderId, setAddToOrderId] = useState<number | null>(null);
  const [ateBookId, setAteBookId] = useState<number>(0);
  const [ateQty, setAteQty] = useState('10');
  const [atePrice, setAtePrice] = useState('');

  useEffect(() => { fetchOrders(); fetchSuppliers(); }, [fetchOrders, fetchSuppliers]);
  const refresh = () => fetchOrders();

  const supplierOptions = suppliers.map(s => ({ value: s.id, label: s.name }));
  const bookOptions = books.map(b => ({ value: b.id, label: `${b.title} (${b.stock} шт.)` }));

  const handleAddNewItem = () => {
    if (!addBookId || !addQty) return;
    const book = books.find(b => b.id === addBookId);
    if (!book) return;
    const price = Number(addPrice) || Math.round(book.price * 0.5);
    setNewItems([...newItems, { bookId: book.id, title: book.title, quantity: Number(addQty), pricePerUnit: price }]);
    setAddBookId(0); setAddQty('10'); setAddPrice('');
  };

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!supplierId || newItems.length === 0) return;
    const sup = suppliers.find(s => s.id === supplierId);
    await createOrder({ supplier: sup!.name, supplierEmail: sup!.email, items: newItems, note: note.trim() });
    setShowCreate(false); setSupplierId(0); setNote(''); setNewItems([]);
    refresh();
  };

  const handleAddToExisting = async () => {
    if (!addToOrderId || !ateBookId || !ateQty) return;
    const book = books.find(b => b.id === ateBookId);
    if (!book) return;
    const price = Number(atePrice) || Math.round(book.price * 0.5);
    await addItem(addToOrderId, { bookId: book.id, title: book.title, quantity: Number(ateQty), pricePerUnit: price });
    setAddToOrderId(null); setAteBookId(0); setAteQty('10'); setAtePrice('');
    refresh();
  };

  const handleExportCSV = (order: typeof orders[0]) => {
    const csv = generateSupplierCSV(order);
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `supplier-order-${order.id}.csv`; a.click();
  };

  const nextStatuses: Partial<Record<SupplierOrderStatus, SupplierOrderStatus>> = {
    draft: 'sent',
    sent: 'confirmed',
    confirmed: 'shipped',
    shipped: 'received',
  };
  const nextLabels: Record<string, string> = { draft: 'Відправити', sent: 'Підтвердити', confirmed: 'В дорозі', shipped: 'Отримано' };

  return (
    <>
      <AdminHeader title="Замовлення постачальникам">
        <button className={styles.createBtn} onClick={() => setShowCreate(true)}><Icon name="add" /> Нове замовлення</button>
      </AdminHeader>

      {orders.map(order => (
        <AdminCard key={order.id} title={`#${order.id} — ${order.supplier}`} icon="business"
          headerRight={<div className={styles.hActions}>
            <span className={styles.badge} style={{ background: `${statusColors[order.status]}12`, color: statusColors[order.status] }}>{statusLabels[order.status]}</span>
            <span className={styles.total}>{order.total.toLocaleString()} ₴</span>
          </div>}>
          <div className={tableStyles.tableWrapper}>
            <table className={tableStyles.table}>
              <thead><tr><th>Книга</th><th>К-сть</th><th>Ціна/од.</th><th>Сума</th>{order.status === 'draft' && <th></th>}</tr></thead>
              <tbody>
                {order.items.map(item => (
                  <tr key={item.bookId}>
                    <td><strong>{item.title}</strong></td>
                    <td>{item.quantity}</td>
                    <td>{item.pricePerUnit} ₴</td>
                    <td><strong>{item.quantity * item.pricePerUnit} ₴</strong></td>
                    {order.status === 'draft' && <td>
                      <button className={styles.removeBtn} onClick={async () => { await removeItem(order.id, item.bookId); refresh(); }}><Icon name="close" /></button>
                    </td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles.orderActions}>
            {order.note && <span className={styles.noteText}><Icon name="comment" /> {order.note}</span>}
            <div className={styles.orderActionsRight}>
              {order.status === 'draft' && (
                <button className={styles.addItemBtn} onClick={() => setAddToOrderId(order.id)}><Icon name="add" /> Додати</button>
              )}
              <button className={styles.csvBtn} onClick={() => handleExportCSV(order)}><Icon name="download" /> CSV</button>
              {nextStatuses[order.status] && (
                <button className={styles.nextBtn} onClick={async () => {
                  const nextStatus = nextStatuses[order.status];
                  if (nextStatus) {
                    await updateStatus(order.id, nextStatus);
                    refresh();
                  }
                }}>
                  <Icon name={order.status === 'shipped' ? 'check_circle' : 'arrow_forward'} /> {nextLabels[order.status]}
                </button>
              )}
            </div>
          </div>
        </AdminCard>
      ))}

      {orders.length === 0 && <div className={styles.empty}><Icon name="business" /><p>Створіть замовлення постачальнику</p></div>}

      {/* Create order modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Нове замовлення постачальнику" wide>
        <form onSubmit={handleCreate} className={styles.createForm}>
          <div className={styles.fg}>
            <label className={styles.fl}>Постачальник <span className={styles.req}>*</span></label>
            <CustomSelect options={supplierOptions} value={supplierId} onChange={v => setSupplierId(Number(v))} placeholder="Оберіть..." required />
          </div>

          <div className={styles.fg}>
            <label className={styles.fl}>Позиції</label>
            <div className={styles.itemsBuilder}>
              {newItems.map((item, i) => (
                <div key={i} className={styles.builtItem}>
                  <span>{item.title}</span>
                  <span className={styles.builtQty}>{item.quantity} шт. × {item.pricePerUnit} ₴</span>
                  <button type="button" className={styles.removeBtn} onClick={() => setNewItems(newItems.filter((_, j) => j !== i))}><Icon name="close" /></button>
                </div>
              ))}
              <div className={styles.addRow}>
                <CustomSelect options={bookOptions} value={addBookId} onChange={v => setAddBookId(Number(v))} placeholder="Книга..." size="compact" />
                <input className={styles.smallInput} type="number" placeholder="К-сть" value={addQty} onChange={e => setAddQty(e.target.value)} />
                <input className={styles.smallInput} type="number" placeholder="Ціна" value={addPrice} onChange={e => setAddPrice(e.target.value)} />
                <button type="button" className={styles.addRowBtn} onClick={handleAddNewItem}><Icon name="add" /></button>
              </div>
            </div>
          </div>

          <div className={styles.fg}>
            <label className={styles.fl}>Примітка</label>
            <input className={styles.fi} type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="Коментар..." />
          </div>

          {newItems.length > 0 && (
            <div className={styles.createTotal}>
              Разом: <strong>{newItems.reduce((s, i) => s + i.quantity * i.pricePerUnit, 0).toLocaleString()} ₴</strong>
            </div>
          )}

          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={() => setShowCreate(false)}>Скасувати</button>
            <button type="submit" className={styles.submitBtn} disabled={!supplierId || newItems.length === 0}><Icon name="check" /> Створити</button>
          </div>
        </form>
      </Modal>

      {/* Add item to existing order */}
      <Modal isOpen={addToOrderId !== null} onClose={() => setAddToOrderId(null)} title="Додати позицію">
        <div className={styles.addToForm}>
          <div className={styles.fg}><label className={styles.fl}>Книга</label><CustomSelect options={bookOptions} value={ateBookId} onChange={v => setAteBookId(Number(v))} placeholder="Оберіть..." /></div>
          <div className={styles.ateRow}>
            <div className={styles.fg}><label className={styles.fl}>К-сть</label><input className={styles.fi} type="number" value={ateQty} onChange={e => setAteQty(e.target.value)} /></div>
            <div className={styles.fg}><label className={styles.fl}>Ціна/од.</label><input className={styles.fi} type="number" value={atePrice} onChange={e => setAtePrice(e.target.value)} placeholder="авто" /></div>
          </div>
          <div className={styles.formActions}>
            <button className={styles.cancelBtn} onClick={() => setAddToOrderId(null)}>Скасувати</button>
            <button className={styles.submitBtn} onClick={handleAddToExisting} disabled={!ateBookId}><Icon name="add" /> Додати</button>
          </div>
        </div>
      </Modal>
    </>
  );
}
