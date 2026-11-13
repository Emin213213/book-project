import { create } from 'zustand';
import type { Category, CategoryFormData } from './category.types';
import * as categoryService from '../api/categoryService.ts';

interface CategoriesState {
  categories: Category[];
  loading: boolean;
  fetchCategories: () => Promise<void>;
  addCategory: (data: CategoryFormData) => Promise<Category>;
  editCategory: (id: number, data: Partial<CategoryFormData & { parentId: number | null }>) => Promise<Category>;
  removeCategory: (id: number) => Promise<void>;
  reorderCategories: (updates: { id: number; parentId: number | null; order: number }[]) => Promise<void>;
}

export const useCategoriesStore = create<CategoriesState>()((set) => ({
  categories: [],
  loading: false,

  fetchCategories: async () => {
    set({ loading: true });
    const categories = await categoryService.getCategories();
    set({ categories, loading: false });
  },

  addCategory: async (data) => {
    const category = await categoryService.createCategory(data);
    return category;
  },

  editCategory: async (id, data) => {
    const category = await categoryService.updateCategory(id, data);
    return category;
  },

  removeCategory: async (id) => {
    await categoryService.deleteCategory(id);
  },

  reorderCategories: async (updates) => {
    await categoryService.reorderCategories(updates);
  },
}));
