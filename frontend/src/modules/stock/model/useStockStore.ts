import { create } from 'zustand';
import type { StockEntry } from './stock.types';
import * as stockService from '../api/stockService.ts';

interface StockState {
  entries: StockEntry[];
  stockMap: Map<number, number>;
  loading: boolean;
  fetchEntries: (bookId?: number) => Promise<void>;
  fetchStock: () => Promise<void>;
  addEntry: (data: Omit<StockEntry, 'id' | 'createdAt'>) => Promise<void>;
}

export const useStockStore = create<StockState>()((set) => ({
  entries: [],
  stockMap: new Map(),
  loading: false,

  fetchEntries: async (bookId) => {
    set({ loading: true });
    const entries = await stockService.getStockEntries(bookId);
    set({ entries, loading: false });
  },

  fetchStock: async () => {
    const stockMap = await stockService.getStock();
    set({ stockMap });
  },

  addEntry: async (data) => {
    await stockService.addStockEntry(data);
  },
}));