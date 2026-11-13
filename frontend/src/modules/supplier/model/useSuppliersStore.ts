import { create } from 'zustand';
import type { Supplier } from './supplier.types';
import * as service from '../api/supplierService.ts';

interface SuppliersState {
  suppliers: Supplier[];
  loading: boolean;
  fetchSuppliers: () => Promise<void>;
  addSupplier: (data: Omit<Supplier, 'id'>) => Promise<Supplier>;
  editSupplier: (id: number, data: Partial<Omit<Supplier, 'id'>>) => Promise<Supplier>;
  removeSupplier: (id: number) => Promise<void>;
}

export const useSuppliersStore = create<SuppliersState>()((set) => ({
  suppliers: [],
  loading: false,
  fetchSuppliers: async () => { set({ loading: true }); const suppliers = await service.getSuppliers(); set({ suppliers, loading: false }); },
  addSupplier: async (data) => service.createSupplier(data),
  editSupplier: async (id, data) => service.updateSupplier(id, data),
  removeSupplier: async (id) => { await service.deleteSupplier(id); },
}));