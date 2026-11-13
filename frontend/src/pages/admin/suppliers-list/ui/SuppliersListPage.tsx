import { useEffect, useState, type FormEvent } from 'react';
import { useSuppliersStore } from '@/modules/supplier';
import type { Supplier } from '@/modules/supplier';
import AdminHeader from '@/shared/ui/admin-header/AdminHeader.tsx';
import AdminCard from '@/shared/ui/admin-card/AdminCard.tsx';
import Modal from '@/shared/ui/Modal.tsx';
import Icon from '@/shared/ui/Icon.tsx';
import styles from './SuppliersListPage.module.css';
import tableStyles from '@/shared/ui/admin-table/AdminTable.module.css';

const emptyForm = { name: '', email: '', phone: '', contactPerson: '', address: '', note: '' };

export default function SuppliersListPage() {
  const { suppliers, fetchSuppliers, addSupplier, editSupplier, removeSupplier } = useSuppliersStore();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchSuppliers(); }, [fetchSuppliers]);

  const filtered = search
    ? suppliers.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.contactPerson.toLowerCase().includes(search.toLowerCase()))
    : suppliers;

  const openAdd = () => { setForm(emptyForm); setShowAdd(true); };
  const openEdit = (s: Supplier) => {
    setEditing(s);
    setForm({ name: s.name, email: s.email, phone: s.phone, contactPerson: s.contactPerson, address: s.address, note: s.note });
  };

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    await addSupplier(form);
    setShowAdd(false); setForm(emptyForm); fetchSuppliers();
  };

  const handleEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    await editSupplier(editing.id, form);
    setEditing(null); setForm(emptyForm); fetchSuppliers();
  };

  const handleDelete = async (id: number) => {
    await removeSupplier(id);
    fetchSuppliers();
  };

  const setField = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const renderForm = (onSubmit: (e: FormEvent) => void, btnLabel: string) => (
    <form onSubmit={onSubmit} className={styles.form}>
      <div className={styles.grid}>
        <div className={styles.fg}>
          <label className={styles.fl}>Назва <span className={styles.req}>*</span></label>
          <input className={styles.fi} value={form.name} onChange={e => setField('name', e.target.value)} placeholder="BookWholesale UA" required />
        </div>
        <div className={styles.fg}>
          <label className={styles.fl}>Контактна особа</label>
          <input className={styles.fi} value={form.contactPerson} onChange={e => setField('contactPerson', e.target.value)} placeholder="Іван Коваленко" />
        </div>
        <div className={styles.fg}>
          <label className={styles.fl}>Email <span className={styles.req}>*</span></label>
          <input className={styles.fi} type="email" value={form.email} onChange={e => setField('email', e.target.value)} placeholder="orders@company.ua" required />
        </div>
        <div className={styles.fg}>
          <label className={styles.fl}>Телефон</label>
          <input className={styles.fi} value={form.phone} onChange={e => setField('phone', e.target.value)} placeholder="+380 (44) 000-00-00" />
        </div>
        <div className={`${styles.fg} ${styles.fgFull}`}>
          <label className={styles.fl}>Адреса</label>
          <input className={styles.fi} value={form.address} onChange={e => setField('address', e.target.value)} placeholder="м. Київ, вул. ..." />
        </div>
        <div className={`${styles.fg} ${styles.fgFull}`}>
          <label className={styles.fl}>Примітка</label>
          <textarea className={styles.ta} rows={2} value={form.note} onChange={e => setField('note', e.target.value)} placeholder="Спеціалізація, умови..." />
        </div>
      </div>
      <div className={styles.formActions}>
        <button type="button" className={styles.cancelBtn} onClick={() => { setShowAdd(false); setEditing(null); }}>Скасувати</button>
        <button type="submit" className={styles.submitBtn}><Icon name={editing ? 'save' : 'add'} /> {btnLabel}</button>
      </div>
    </form>
  );

  return (
    <>
      <AdminHeader title="Довідник постачальників">
        <button className={styles.addBtn} onClick={openAdd}><Icon name="add" /> Додати постачальника</button>
      </AdminHeader>

      <AdminCard title={`Постачальники (${suppliers.length})`} icon="business"
        headerRight={
          <div className={tableStyles.tableSearch}>
            <Icon name="search" />
            <input type="text" placeholder="Пошук..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        }
      >
        <div className={styles.cards}>
          {filtered.map(s => (
            <div key={s.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div className={styles.cardAvatar}>{s.name.slice(0, 2).toUpperCase()}</div>
                <div className={styles.cardMain}>
                  <span className={styles.cardName}>{s.name}</span>
                  <span className={styles.cardContact}>{s.contactPerson || '—'}</span>
                </div>
                <div className={styles.cardActions}>
                  <button className={`${tableStyles.btnTable} ${tableStyles.btnEdit}`} onClick={() => openEdit(s)}><Icon name="edit" /></button>
                  <button className={`${tableStyles.btnTable} ${tableStyles.btnDelete}`} onClick={() => handleDelete(s.id)}><Icon name="delete_outline" /></button>
                </div>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardRow}><Icon name="email" /><span>{s.email}</span></div>
                {s.phone && <div className={styles.cardRow}><Icon name="phone" /><span>{s.phone}</span></div>}
                {s.address && <div className={styles.cardRow}><Icon name="place" /><span>{s.address}</span></div>}
                {s.note && <div className={styles.cardNote}>{s.note}</div>}
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className={styles.empty}>Постачальників не знайдено</div>}
        </div>
      </AdminCard>

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Додати постачальника" wide>
        {renderForm(handleAdd, 'Додати')}
      </Modal>

      <Modal isOpen={editing !== null} onClose={() => setEditing(null)} title="Редагувати постачальника" wide>
        {renderForm(handleEdit, 'Зберегти')}
      </Modal>
    </>
  );
}
