import type { Discount } from '../model/discount.types';
import initialDiscounts from './discounts.json';

let discounts: Discount[] = [...initialDiscounts] as Discount[];
let nextId = Math.max(...discounts.map(d => d.id)) + 1;

export async function getDiscounts(): Promise<Discount[]> {
  return [...discounts];
}

export async function getDiscountByCode(code: string): Promise<Discount | undefined> {
  return discounts.find(d => d.code.toLowerCase() === code.toLowerCase() && d.active);
}

export async function createDiscount(data: Omit<Discount, 'id' | 'usedCount'>): Promise<Discount> {
  const discount: Discount = { ...data, id: nextId++, usedCount: 0 };
  discounts.push(discount);
  return discount;
}

export async function updateDiscount(id: number, data: Partial<Omit<Discount, 'id'>>): Promise<Discount> {
  const idx = discounts.findIndex(d => d.id === id);
  if (idx === -1) throw new Error('Not found');
  discounts[idx] = { ...discounts[idx], ...data };
  return discounts[idx];
}

export async function deleteDiscount(id: number): Promise<void> {
  discounts = discounts.filter(d => d.id !== id);
}

export function applyDiscount(discount: Discount, subtotal: number): number {
  const now = new Date();
  if (!discount.active) return 0;
  if (now < new Date(discount.startsAt) || now > new Date(discount.endsAt)) return 0;
  if (discount.maxUses > 0 && discount.usedCount >= discount.maxUses) return 0;
  if (subtotal < discount.minOrder) return 0;
  if (discount.type === 'percent') return Math.round(subtotal * discount.value / 100);
  return Math.min(discount.value, subtotal);
}
