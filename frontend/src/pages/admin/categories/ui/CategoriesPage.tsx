import { useEffect, useState, type FormEvent } from 'react';
import { useCategoriesStore } from '@/modules/category';
import type { Category } from '@/modules/category';
import AdminHeader from '@/shared/ui/admin-header/AdminHeader.tsx';
import AdminCard from '@/shared/ui/admin-card/AdminCard.tsx';
import { CategoryTree } from '@/modules/category';
import Modal from '@/shared/ui/Modal.tsx';
import Icon from '@/shared/ui/Icon.tsx';
import styles from './CategoriesPage.module.css';

export default function CategoriesPage() {
  const { categories, fetchCategories, addCategory, editCategory, removeCategory, reorderCategories } = useCategoriesStore();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [editing, setEditing] = useState<Category | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const autoSlug = slug.trim() || name.trim().toLowerCase().replace(/[^a-z0-9]+/gi, '-');
    await addCategory({ name: name.trim(), slug: autoSlug });
    setName('');
    setSlug('');
    fetchCategories();
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setEditName(cat.name);
    setEditSlug(cat.slug);
  };

  const handleSaveEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing || !editName.trim()) return;
    await editCategory(editing.id, { name: editName.trim(), slug: editSlug.trim() });
    setEditing(null);
    fetchCategories();
  };

  const handleDelete = async (id: number) => {
    await removeCategory(id);
    fetchCategories();
  };

  const handleReorder = async (updates: { id: number; parentId: number | null; order: number }[]) => {
    await reorderCategories(updates);
    fetchCategories();
  };

  return (
    <>
      <AdminHeader title="Категории" />

      <AdminCard title="Добавить категорию" icon="add_circle_outline">
        <form className={styles.inlineForm} onSubmit={handleSubmit}>
          <div className={styles.inlineGroup}>
            <label className={styles.label}>Название</label>
            <input
              className={styles.input}
              type="text"
              placeholder="Название категории..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className={styles.inlineGroup}>
            <label className={styles.label}>Slug</label>
            <input
              className={styles.input}
              type="text"
              placeholder="action-adventure"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
            />
          </div>
          <button type="submit" className={styles.inlineBtn}>
            <Icon name="add" />
            Добавить
          </button>
        </form>
      </AdminCard>

      <AdminCard title="Все категории" icon="list">
        <CategoryTree
          categories={categories}
          onReorder={handleReorder}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      </AdminCard>

      <div className={styles.hint}>
        <Icon name="info" />
        Перетащите категорию для сортировки. Сдвиньте вправо для вложения в категорию выше.
      </div>

      <Modal
        isOpen={editing !== null}
        onClose={() => setEditing(null)}
        title="Редактировать категорию"
      >
        <form onSubmit={handleSaveEdit}>
          <div className={styles.modalGroup}>
            <label className={styles.label}>Название</label>
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
            <label className={styles.label}>Slug</label>
            <input
              className={styles.input}
              type="text"
              value={editSlug}
              onChange={(e) => setEditSlug(e.target.value)}
            />
          </div>
          <div className={styles.modalActions}>
            <button type="button" className={styles.btnGhost} onClick={() => setEditing(null)}>
              Отменить
            </button>
            <button type="submit" className={styles.inlineBtn}>
              <Icon name="save" />
              Сохранить
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
