import { create } from 'zustand';
import type { Discount } from './discount.types';
import * as service from '../api/discountService.ts';

interface DiscountsState {
  discounts: Discount[];
  loading: boolean;
  fetchDiscounts: () => Promise<void>;
  addDiscount: (data: Omit<Discount, 'id' | 'usedCount'>) => Promise<Discount>;
  editDiscount: (id: number, data: Partial<Omit<Discount, 'id'>>) => Promise<Discount>;
  removeDiscount: (id: number) => Promise<void>;
  getByCode: (code: string) => Promise<Discount | undefined>;
}

export const useDiscountsStore = create<DiscountsState>()((set) => ({
  discounts: [],
  loading: false,
  fetchDiscounts: async () => { set({ loading: true }); const discounts = await service.getDiscounts(); set({ discounts, loading: false }); },
  addDiscount: async (data) => service.createDiscount(data),
  editDiscount: async (id, data) => service.updateDiscount(id, data),
  removeDiscount: async (id) => { await service.deleteDiscount(id); },
  getByCode: async (code) => service.getDiscountByCode(code),
}));
