import type { User } from '@/modules/user';

import type { Order, OrderFormData, OrderItem, OrderStatus } from '../model/order.types';
import initialOrders from './orders.json';

const orders: Order[] = [...initialOrders] as Order[];
let nextId = Math.max(...orders.map(o => o.id)) + 1;

export async function getOrders(): Promise<Order[]> {
  return [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getOrderById(id: number): Promise<Order | undefined> {
  return orders.find(o => o.id === id);
}

export async function getOrdersByUserId(userId: User['id']): Promise<Order[]> {
  return orders
    .filter(o => o.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function assignManager(orderId: number, managerId: number | null): Promise<Order> {
  const idx = orders.findIndex(o => o.id === orderId);
  if (idx === -1) throw new Error('Order not found');
  orders[idx] = { ...orders[idx], managerId };
  return orders[idx];
}

export async function createOrder(data: OrderFormData): Promise<Order> {
  const order: Order = {
    ...data,
    id: nextId++,
    userId: data.userId ?? null,
    managerId: null,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  orders.push(order);
  return order;
}

export async function updateOrderItems(id: number, items: OrderItem[]): Promise<Order> {
  const idx = orders.findIndex(o => o.id === id);
  if (idx === -1) throw new Error('Order not found');
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  orders[idx] = { ...orders[idx], items, total };
  return orders[idx];
}

export async function updateOrderStatus(id: number, status: OrderStatus): Promise<Order> {
  const idx = orders.findIndex(o => o.id === id);
  if (idx === -1) throw new Error('Order not found');
  orders[idx] = { ...orders[idx], status };
  return orders[idx];
}
