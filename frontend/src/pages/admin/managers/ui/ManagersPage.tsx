import { useEffect, useState, type FormEvent } from 'react';
import { useManagersStore } from '@/modules/manager';
import type { Manager } from '@/modules/manager';
import AdminHeader from '@/shared/ui/admin-header/AdminHeader.tsx';
import AdminCard from '@/shared/ui/admin-card/AdminCard.tsx';
import Modal from '@/shared/ui/Modal.tsx';
import CustomSelect from '@/shared/ui/CustomSelect.tsx';
import Icon from '@/shared/ui/Icon.tsx';
import styles from './ManagersPage.module.css';
import tableStyles from '@/shared/ui/admin-table/AdminTable.module.css';

function getInitials(name: string): string {
  return name.split(' ').filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

const roleOptions = [
  { value: 'manager', label: 'Менеджер' },
  { value: 'senior', label: 'Старший менеджер' },
];

export default function ManagersPage() {
  const { managers, fetchManagers, addManager, editManager, removeManager } = useManagersStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<string>('manager');

  const [editing, setEditing] = useState<Manager | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<string>('manager');

  useEffect(() => {
    fetchManagers();
  }, [fetchManagers]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    await addManager({ name: name.trim(), email: email.trim(), role: role as Manager['role'], avatar: null });
    setName(''); setEmail(''); setRole('manager');
    fetchManagers();
  };

  const openEdit = (m: Manager) => {
    setEditing(m);
    setEditName(m.name);
    setEditEmail(m.email);
    setEditRole(m.role);
  };

  const handleSaveEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    await editManager(editing.id, { name: editName.trim(), email: editEmail.trim(), role: editRole as Manager['role'] });
    setEditing(null);
    fetchManagers();
  };

  const handleDelete = async (id: number) => {
    await removeManager(id);
    fetchManagers();
  };

  return (
    <>
      <AdminHeader title="Менеджери" />

      <AdminCard title="Додати менеджера" icon="person_add">
        <form className={styles.addForm} onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            <div className={styles.group}>
              <label className={styles.label}>Ім'я <span className={styles.required}>*</span></label>
              <input className={styles.input} type="text" placeholder="Повне ім'я..." value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className={styles.group}>
              <label className={styles.label}>Email <span className={styles.required}>*</span></label>
              <input className={styles.input} type="email" placeholder="email@bookapp.ua" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className={styles.group}>
              <label className={styles.label}>Роль</label>
              <CustomSelect options={roleOptions} value={role} onChange={v => setRole(String(v))} />
            </div>
          </div>
          <div className={styles.formActions}>
            <button type="submit" className={styles.btnPrimary}>
              <Icon name="person_add" /> Додати
            </button>
          </div>
        </form>
      </AdminCard>

      <AdminCard title="Усі менеджери" icon="groups">
        <div className={tableStyles.tableWrapper}>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th></th>
                <th>Ім'я</th>
                <th>Email</th>
                <th>Роль</th>
                <th>Дії</th>
              </tr>
            </thead>
            <tbody>
              {managers.map(m => (
                <tr key={m.id}>
                  <td>
                    <div className={tableStyles.authorAvatar}>{getInitials(m.name)}</div>
                  </td>
                  <td><strong>{m.name}</strong></td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{m.email}</td>
                  <td>
                    <span className={`${styles.roleBadge} ${m.role === 'senior' ? styles.roleSenior : ''}`}>
                      {m.role === 'senior' ? 'Старший' : 'Менеджер'}
                    </span>
                  </td>
                  <td>
                    <div className={tableStyles.tableActions}>
                      <button className={`${tableStyles.btnTable} ${tableStyles.btnEdit}`} onClick={() => openEdit(m)}>
                        <Icon name="edit" />
                      </button>
                      <button className={`${tableStyles.btnTable} ${tableStyles.btnDelete}`} onClick={() => handleDelete(m.id)}>
                        <Icon name="delete_outline" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminCard>

      <Modal isOpen={editing !== null} onClose={() => setEditing(null)} title="Редагувати менеджера">
        <form onSubmit={handleSaveEdit}>
          <div className={styles.modalGroup}>
            <label className={styles.label}>Ім'я</label>
            <input className={styles.input} type="text" value={editName} onChange={e => setEditName(e.target.value)} required autoFocus />
          </div>
          <div className={styles.modalGroup}>
            <label className={styles.label}>Email</label>
            <input className={styles.input} type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)} required />
          </div>
          <div className={styles.modalGroup}>
            <label className={styles.label}>Роль</label>
            <CustomSelect options={roleOptions} value={editRole} onChange={v => setEditRole(String(v))} />
          </div>
          <div className={styles.modalActions}>
            <button type="button" className={styles.btnGhost} onClick={() => setEditing(null)}>Скасувати</button>
            <button type="submit" className={styles.btnPrimary}><Icon name="save" /> Зберегти</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
