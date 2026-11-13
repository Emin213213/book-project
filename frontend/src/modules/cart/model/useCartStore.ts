import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from './cart.types';

interface CartState {
  items: CartItem[];
  addItem: (bookId: number) => void;
  removeItem: (bookId: number) => void;
  updateQuantity: (bookId: number, quantity: number) => void;
  clear: () => void;
  getQuantity: (bookId: number) => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (bookId) =>
        set((state) => {
          const existing = state.items.find(i => i.bookId === bookId);
          if (existing) {
            return { items: state.items.map(i => i.bookId === bookId ? { ...i, quantity: i.quantity + 1 } : i) };
          }
          return { items: [...state.items, { bookId, quantity: 1 }] };
        }),

      removeItem: (bookId) =>
        set((state) => ({ items: state.items.filter(i => i.bookId !== bookId) })),

      updateQuantity: (bookId, quantity) =>
        set((state) => {
          if (quantity <= 0) return { items: state.items.filter(i => i.bookId !== bookId) };
          return { items: state.items.map(i => i.bookId === bookId ? { ...i, quantity } : i) };
        }),

      clear: () => set({ items: [] }),

      getQuantity: (bookId) => get().items.find(i => i.bookId === bookId)?.quantity ?? 0,
    }),
    { name: 'book-app-cart' },
  ),
);
