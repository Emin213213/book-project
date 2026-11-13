import { create } from 'zustand';
import type { SupplierOrder, SupplierOrderItem, SupplierOrderStatus } from './supplier-order.types';
import * as service from '../api/supplierOrderService.ts';

interface SupplierOrdersState {
  orders: SupplierOrder[];
  loading: boolean;
  fetchOrders: () => Promise<void>;
  createOrder: (data: { supplier: string; supplierEmail: string; items: SupplierOrderItem[]; note: string }) => Promise<SupplierOrder>;
  addItem: (orderId: number, item: SupplierOrderItem) => Promise<void>;
  removeItem: (orderId: number, bookId: number) => Promise<void>;
  updateStatus: (id: number, status: SupplierOrderStatus) => Promise<void>;
}

export const useSupplierOrdersStore = create<SupplierOrdersState>()((set) => ({
  orders: [],
  loading: false,
  fetchOrders: async () => { set({ loading: true }); const orders = await service.getSupplierOrders(); set({ orders, loading: false }); },
  createOrder: async (data) => service.createSupplierOrder(data),
  addItem: async (orderId, item) => { await service.addItemToOrder(orderId, item); },
  removeItem: async (orderId, bookId) => { await service.removeItemFromOrder(orderId, bookId); },
  updateStatus: async (id, status) => { await service.updateSupplierOrderStatus(id, status); },
}));