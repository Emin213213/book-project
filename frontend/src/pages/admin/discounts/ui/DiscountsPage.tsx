import { useEffect, useState, type FormEvent } from 'react';
import { useDiscountsStore } from '@/modules/discount';
import { useCategoriesStore } from '@/modules/category';
import type { Discount } from '@/modules/discount';
import AdminHeader from '@/shared/ui/admin-header/AdminHeader.tsx';
import AdminCard from '@/shared/ui/admin-card/AdminCard.tsx';
import Modal from '@/shared/ui/Modal.tsx';
import CustomSelect from '@/shared/ui/CustomSelect.tsx';
import Icon from '@/shared/ui/Icon.tsx';
import styles from './DiscountsPage.module.css';
import tableStyles from '@/shared/ui/admin-table/AdminTable.module.css';

const emptyForm: Omit<Discount, 'id' | 'usedCount'> = {
  code: '',
  type: 'percent',
  value: 10,
  minOrder: 0,
  maxUses: 0,
  categoryId: null,
  startsAt: '',
  endsAt: '',
  active: true,
};

export default function DiscountsPage() {
  const { discounts, fetchDiscounts, addDiscount, editDiscount, removeDiscount } = useDiscountsStore();
  const { categories, fetchCategories } = useCategoriesStore();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Discount | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchDiscounts(); fetchCategories(); }, [fetchDiscounts, fetchCategories]);

  const openAdd = () => { setForm(emptyForm); setShowAdd(true); };
  const openEdit = (d: Discount) => {
    setEditing(d);
    setForm({ code: d.code, type: d.type, value: d.value, minOrder: d.minOrder, maxUses: d.maxUses, categoryId: d.categoryId, startsAt: d.startsAt.slice(0, 10), endsAt: d.endsAt.slice(0, 10), active: d.active });
  };

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    await addDiscount({ ...form, startsAt: new Date(form.startsAt).toISOString(), endsAt: new Date(form.endsAt + 'T23:59:59').toISOString() });
    setShowAdd(false); fetchDiscounts();
  };

  const handleEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    await editDiscount(editing.id, { ...form, startsAt: new Date(form.startsAt).toISOString(), endsAt: new Date(form.endsAt + 'T23:59:59').toISOString() });
    setEditing(null); fetchDiscounts();
  };

  const toggleActive = async (d: Discount) => { await editDiscount(d.id, { active: !d.active }); fetchDiscounts(); };
  const handleDelete = async (id: number) => { await removeDiscount(id); fetchDiscounts(); };

  const setField = (key: string, val: unknown) => setForm(f => ({ ...f, [key]: val }));

  const isExpired = (d: Discount) => new Date() > new Date(d.endsAt);
  const categoryOptions = [{ value: '', label: 'Усі категорії' }, ...categories.map(c => ({ value: c.id, label: c.name }))];
  const typeOptions = [{ value: 'percent', label: 'Відсоток (%)' }, { value: 'fixed', label: 'Фіксована (₴)' }];

  const renderForm = (onSubmit: (e: FormEvent) => void, label: string) => (
    <form onSubmit={onSubmit} className={styles.form}>
      <div className={styles.grid}>
        <div className={styles.fg}><label className={styles.fl}>Промокод <span className={styles.req}>*</span></label>
          <input className={styles.fi} value={form.code} onChange={e => setField('code', e.target.value.toUpperCase())} placeholder="WELCOME10" required /></div>
        <div className={styles.fg}><label className={styles.fl}>Тип</label>
          <CustomSelect options={typeOptions} value={form.type} onChange={v => setField('type', v)} /></div>
        <div className={styles.fg}><label className={styles.fl}>Значення <span className={styles.req}>*</span></label>
          <input className={styles.fi} type="number" value={form.value} onChange={e => setField('value', Number(e.target.value))} required /></div>
        <div className={styles.fg}><label className={styles.fl}>Мін. замовлення (₴)</label>
          <input className={styles.fi} type="number" value={form.minOrder} onChange={e => setField('minOrder', Number(e.target.value))} /></div>
        <div className={styles.fg}><label className={styles.fl}>Макс. використань</label>
          <input className={styles.fi} type="number" value={form.maxUses} onChange={e => setField('maxUses', Number(e.target.value))} placeholder="0 = безлімітно" /></div>
        <div className={styles.fg}><label className={styles.fl}>Категорія</label>
          <CustomSelect options={categoryOptions} value={form.categoryId ?? ''} onChange={v => setField('categoryId', v === '' ? null : Number(v))} placeholder="Усі" /></div>
        <div className={styles.fg}><label className={styles.fl}>Початок <span className={styles.req}>*</span></label>
          <input className={styles.fi} type="date" value={form.startsAt} onChange={e => setField('startsAt', e.target.value)} required /></div>
        <div className={styles.fg}><label className={styles.fl}>Закінчення <span className={styles.req}>*</span></label>
          <input className={styles.fi} type="date" value={form.endsAt} onChange={e => setField('endsAt', e.target.value)} required /></div>
      </div>
      <div className={styles.formActions}>
        <button type="button" className={styles.cancelBtn} onClick={() => { setShowAdd(false); setEditing(null); }}>Скасувати</button>
        <button type="submit" className={styles.submitBtn}><Icon name={editing ? 'save' : 'add'} /> {label}</button>
      </div>
    </form>
  );

  return (
    <>
      <AdminHeader title="Знижки та промокоди">
        <button className={styles.addBtn} onClick={openAdd}><Icon name="add" /> Новий промокод</button>
      </AdminHeader>

      <AdminCard title={`Промокоди (${discounts.length})`} icon="local_offer">
        <div className={tableStyles.tableWrapper}>
          <table className={tableStyles.table}>
            <thead>
              <tr><th>Код</th><th>Тип</th><th>Значення</th><th>Мін.</th><th>Використань</th><th>Період</th><th>Статус</th><th>Дії</th></tr>
            </thead>
            <tbody>
              {discounts.map(d => (
                <tr key={d.id} style={{ opacity: !d.active || isExpired(d) ? 0.5 : 1 }}>
                  <td><code className={styles.codeCell}>{d.code}</code></td>
                  <td>{d.type === 'percent' ? '%' : '₴'}</td>
                  <td><strong>{d.value}{d.type === 'percent' ? '%' : ' ₴'}</strong></td>
                  <td>{d.minOrder > 0 ? `${d.minOrder} ₴` : '—'}</td>
                  <td>{d.usedCount}{d.maxUses > 0 ? ` / ${d.maxUses}` : ''}</td>
                  <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    {new Date(d.startsAt).toLocaleDateString('uk-UA')} — {new Date(d.endsAt).toLocaleDateString('uk-UA')}
                  </td>
                  <td>
                    {isExpired(d) ? <span className={styles.expiredBadge}>Закінчився</span>
                      : d.active ? <span className={styles.activeBadge}>Активний</span>
                      : <span className={styles.inactiveBadge}>Вимкнено</span>}
                  </td>
                  <td>
                    <div className={tableStyles.tableActions}>
                      <button className={`${tableStyles.btnTable} ${tableStyles.btnEdit}`} onClick={() => toggleActive(d)} title={d.active ? 'Вимкнути' : 'Увімкнути'}>
                        <Icon name={d.active ? 'toggle_on' : 'toggle_off'} />
                      </button>
                      <button className={`${tableStyles.btnTable} ${tableStyles.btnEdit}`} onClick={() => openEdit(d)}><Icon name="edit" /></button>
                      <button className={`${tableStyles.btnTable} ${tableStyles.btnDelete}`} onClick={() => handleDelete(d.id)}><Icon name="delete_outline" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Новий промокод" wide>{renderForm(handleAdd, 'Створити')}</Modal>
      <Modal isOpen={editing !== null} onClose={() => setEditing(null)} title="Редагувати промокод" wide>{renderForm(handleEdit, 'Зберегти')}</Modal>
    </>
  );
}
