import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuthorsStore } from '@/modules/author';
import type { Author } from '@/modules/author';
import AdminHeader from '@/shared/ui/admin-header/AdminHeader.tsx';
import AdminCard from '@/shared/ui/admin-card/AdminCard.tsx';
import Modal from '@/shared/ui/Modal.tsx';
import PhotoUpload from '@/shared/ui/PhotoUpload.tsx';
import Icon from '@/shared/ui/Icon.tsx';
import styles from './AuthorsPage.module.css';
import tableStyles from '@/shared/ui/admin-table/AdminTable.module.css';

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function AuthorsPage() {
  const { authors, fetchAuthors, addAuthor, editAuthor, removeAuthor } = useAuthorsStore();
  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);

  const [editing, setEditing] = useState<Author | null>(null);
  const [editName, setEditName] = useState('');
  const [editCountry, setEditCountry] = useState('');
  const [editBirthYear, setEditBirthYear] = useState('');
  const [editPhoto, setEditPhoto] = useState<string | null>(null);

  useEffect(() => {
    fetchAuthors(search || undefined);
  }, [search, fetchAuthors]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await addAuthor({
      name: name.trim(),
      country: country.trim(),
      birthYear: Number(birthYear) || 0,
      photo,
    });
    setName('');
    setCountry('');
    setBirthYear('');
    setPhoto(null);
    fetchAuthors(search || undefined);
  };

  const openEdit = (author: Author) => {
    setEditing(author);
    setEditName(author.name);
    setEditCountry(author.country);
    setEditBirthYear(String(author.birthYear || ''));
    setEditPhoto(author.photo);
  };

  const handleSaveEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing || !editName.trim()) return;
    await editAuthor(editing.id, {
      name: editName.trim(),
      country: editCountry.trim(),
      birthYear: Number(editBirthYear) || 0,
      photo: editPhoto,
    });
    setEditing(null);
    fetchAuthors(search || undefined);
  };

  const handleDelete = async (id: number) => {
    await removeAuthor(id);
    fetchAuthors(search || undefined);
  };

  return (
    <>
      <AdminHeader title="Авторы" />

      <AdminCard title="Добавить автора" icon="person_add">
        <form className={styles.authorForm} onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            <div className={styles.group}>
              <label className={styles.label}>
                Имя автора <span className={styles.required}>*</span>
              </label>
              <input
                className={styles.input}
                type="text"
                placeholder="Полное имя..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className={styles.group}>
              <label className={styles.label}>Страна</label>
              <input
                className={styles.input}
                type="text"
                placeholder="Великобритания..."
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>
            <div className={styles.group}>
              <label className={styles.label}>Год рождения</label>
              <input
                className={styles.input}
                type="number"
                placeholder="1892"
                min="1000"
                max="2030"
                value={birthYear}
                onChange={(e) => setBirthYear(e.target.value)}
              />
            </div>
            <div className={styles.group}>
              <label className={styles.label}>Фото</label>
              <PhotoUpload value={photo} onChange={setPhoto} size="compact" />
            </div>
          </div>
          <div className={styles.formActions}>
            <button
              type="reset"
              className={styles.btnGhost}
              onClick={() => setPhoto(null)}
            >
              <Icon name="restart_alt" />
              Очистить
            </button>
            <button type="submit" className={styles.btnPrimary}>
              <Icon name="person_add" />
              Добавить автора
            </button>
          </div>
        </form>
      </AdminCard>

      <AdminCard
        title="Все авторы"
        icon="people"
        headerRight={
          <div className={tableStyles.tableSearch}>
            <Icon name="search" />
            <input
              type="text"
              placeholder="Поиск по имени..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        }
      >
        <div className={tableStyles.tableWrapper}>
          <table className={tableStyles.table}>
            <thead>
              <tr>
                <th>Фото</th>
                <th>Имя</th>
                <th>Страна</th>
                <th>Год рожд.</th>
                <th>Книг</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {authors.map((author) => (
                <tr key={author.id}>
                  <td>
                    {author.photo ? (
                      <img src={author.photo} alt={author.name} className={styles.avatarImg} />
                    ) : (
                      <div className={tableStyles.authorAvatar}>
                        {getInitials(author.name)}
                      </div>
                    )}
                  </td>
                  <td><Link to={`/admin/authors/${author.id}`} className={styles.nameLink}><strong>{author.name}</strong></Link></td>
                  <td>{author.country}</td>
                  <td>{author.birthYear}</td>
                  <td>{author.booksCount}</td>
                  <td>
                    <div className={tableStyles.tableActions}>
                      <button
                        className={`${tableStyles.btnTable} ${tableStyles.btnEdit}`}
                        title="Редактировать"
                        onClick={() => openEdit(author)}
                      >
                        <Icon name="edit" />
                      </button>
                      <button
                        className={`${tableStyles.btnTable} ${tableStyles.btnDelete}`}
                        title="Удалить"
                        onClick={() => handleDelete(author.id)}
                      >
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

      <Modal
        isOpen={editing !== null}
        onClose={() => setEditing(null)}
        title="Редактировать автора"
      >
        <form onSubmit={handleSaveEdit}>
          <div className={styles.modalGroup}>
            <label className={styles.label}>Фото</label>
            <PhotoUpload value={editPhoto} onChange={setEditPhoto} />
          </div>
          <div className={styles.modalGroup}>
            <label className={styles.label}>
              Имя автора <span className={styles.required}>*</span>
            </label>
            <input
              className={styles.input}
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div className={styles.modalGroup}>
            <label className={styles.label}>Страна</label>
            <input
              className={styles.input}
              type="text"
              value={editCountry}
              onChange={(e) => setEditCountry(e.target.value)}
            />
          </div>
          <div className={styles.modalGroup}>
            <label className={styles.label}>Год рождения</label>
            <input
              className={styles.input}
              type="number"
              value={editBirthYear}
              onChange={(e) => setEditBirthYear(e.target.value)}
              min="1000"
              max="2030"
            />
          </div>
          <div className={styles.modalActions}>
            <button type="button" className={styles.btnGhost} onClick={() => setEditing(null)}>
              Отменить
            </button>
            <button type="submit" className={styles.btnPrimary}>
              <Icon name="save" />
              Сохранить
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
