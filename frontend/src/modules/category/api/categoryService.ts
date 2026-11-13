import type { Category, CategoryFormData } from '../model/category.types';
import initialCategories from './categories.json';

let categories: Category[] = [...initialCategories];
let nextId = Math.max(...categories.map(c => c.id)) + 1;

export async function getCategories(): Promise<Category[]> {
  return [...categories].sort((a, b) => a.order - b.order);
}

export async function getCategoryById(id: number): Promise<Category | undefined> {
  return categories.find(c => c.id === id);
}

export async function createCategory(data: CategoryFormData): Promise<Category> {
  const maxOrder = Math.max(-1, ...categories.map(c => c.order));
  const category: Category = {
    ...data,
    id: nextId++,
    booksCount: 0,
    parentId: data.parentId ?? null,
    order: maxOrder + 1,
  };
  categories.push(category);
  return category;
}

export async function updateCategory(id: number, data: Partial<CategoryFormData & { order: number; parentId: number | null }>): Promise<Category> {
  const idx = categories.findIndex(c => c.id === id);
  if (idx === -1) throw new Error('Category not found');
  categories[idx] = { ...categories[idx], ...data };
  return categories[idx];
}

export async function deleteCategory(id: number): Promise<void> {
  // Переносим дочерние на уровень удаляемой категории
  const cat = categories.find(c => c.id === id);
  if (cat) {
    categories.forEach(c => {
      if (c.parentId === id) c.parentId = cat.parentId;
    });
  }
  categories = categories.filter(c => c.id !== id);
}

export async function reorderCategories(updates: { id: number; parentId: number | null; order: number }[]): Promise<void> {
  for (const u of updates) {
    const cat = categories.find(c => c.id === u.id);
    if (cat) {
      cat.parentId = u.parentId;
      cat.order = u.order;
    }
  }
}
