import type { User } from '@/modules/user';

export interface OrderItem {
  bookId: number;
  title: string;
  price: number;
  quantity: number;
}

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'packing'
  | 'shipped'
  | 'on_hold'
  | 'completed'
  | 'cancelled';

export interface Order {
  id: number;
  userId: User['id'] | null;
  managerId: number | null;
  items: OrderItem[];
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  total: number;
  status: OrderStatus;
  createdAt: string;
}

export interface OrderFormData {
  userId?: User['id'] | null;
  items: OrderItem[];
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  total: number;
}
