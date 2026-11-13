import { create } from 'zustand';
import type { Order, OrderFormData, OrderItem, OrderStatus } from './order.types';
import * as orderService from '../api/orderService.ts';

interface OrdersState {
  orders: Order[];
  currentOrder: Order | null;
  loading: boolean;
  fetchOrders: () => Promise<void>;
  fetchOrderById: (id: number) => Promise<void>;
  createOrder: (data: OrderFormData) => Promise<Order>;
  updateStatus: (id: number, status: OrderStatus) => Promise<void>;
  assignManager: (orderId: number, managerId: number | null) => Promise<void>;
  updateItems: (orderId: number, items: OrderItem[]) => Promise<void>;
}

export const useOrdersStore = create<OrdersState>()((set) => ({
  orders: [],
  currentOrder: null,
  loading: false,

  fetchOrders: async () => {
    set({ loading: true });
    const orders = await orderService.getOrders();
    set({ orders, loading: false });
  },

  fetchOrderById: async (id) => {
    set({ loading: true, currentOrder: null });
    const order = await orderService.getOrderById(id);
    set({ currentOrder: order ?? null, loading: false });
  },

  createOrder: async (data) => {
    const order = await orderService.createOrder(data);
    return order;
  },

  updateStatus: async (id, status) => {
    await orderService.updateOrderStatus(id, status);
  },

  assignManager: async (orderId, managerId) => {
    await orderService.assignManager(orderId, managerId);
  },

  updateItems: async (orderId, items) => {
    await orderService.updateOrderItems(orderId, items);
  },
}));
