import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StockSubscription } from './stock-subscription.types';

interface StockSubscriptionsState {
  subscriptions: StockSubscription[];
  subscribe: (bookId: number) => void;
  unsubscribe: (bookId: number) => void;
  isSubscribed: (bookId: number) => boolean;
}

export const useStockSubscriptionsStore = create<StockSubscriptionsState>()(
  persist(
    (set, get) => ({
      subscriptions: [
        { bookId: 5, createdAt: '2026-03-26T10:00:00.000Z' },
        { bookId: 9, createdAt: '2026-03-27T15:30:00.000Z' },
      ],

      subscribe: (bookId) =>
        set((state) => {
          if (state.subscriptions.some(s => s.bookId === bookId)) return state;
          return { subscriptions: [...state.subscriptions, { bookId, createdAt: new Date().toISOString() }] };
        }),

      unsubscribe: (bookId) =>
        set((state) => ({ subscriptions: state.subscriptions.filter(s => s.bookId !== bookId) })),

      isSubscribed: (bookId) => get().subscriptions.some(s => s.bookId === bookId),
    }),
    {
      name: 'book-app-stock-subs',
      merge: (persisted, current) => {
        const p = persisted as Partial<StockSubscriptionsState> | undefined;
        if (p?.subscriptions && p.subscriptions.length > 0) return { ...current, ...p };
        return current; // keep defaults if localStorage is empty
      },
    },
  ),
);