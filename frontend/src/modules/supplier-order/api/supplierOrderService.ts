import type { SupplierOrder, SupplierOrderItem, SupplierOrderStatus } from '../model/supplier-order.types';

const orders: SupplierOrder[] = [
  {
    id: 1, supplier: 'BookWholesale UA', supplierEmail: 'orders@bookwholesale.ua',
    items: [
      { bookId: 5, title: '1984', quantity: 20, pricePerUnit: 280 },
      { bookId: 9, title: 'Сияние', quantity: 15, pricePerUnit: 360 },
    ],
    status: 'confirmed', note: 'Очікуємо доставку 02.04', total: 10_800, createdAt: '2026-03-26T10:00:00.000Z',
  },
  {
    id: 2, supplier: 'Librex', supplierEmail: 'supply@librex.com.ua',
    items: [
      { bookId: 8, title: 'Дюна', quantity: 10, pricePerUnit: 450 },
    ],
    status: 'sent', note: '', total: 4_500, createdAt: '2026-03-28T15:00:00.000Z',
  },
];
let nextId = 3;

export async function getSupplierOrders(): Promise<SupplierOrder[]> {
  return [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getSupplierOrderById(id: number): Promise<SupplierOrder | undefined> {
  return orders.find(o => o.id === id);
}

export async function createSupplierOrder(data: {
  supplier: string;
  supplierEmail: string;
  items: SupplierOrderItem[];
  note: string;
}): Promise<SupplierOrder> {
  const total = data.items.reduce((s, i) => s + i.quantity * i.pricePerUnit, 0);
  const order: SupplierOrder = { ...data, id: nextId++, status: 'draft', total, createdAt: new Date().toISOString() };
  orders.push(order);
  return order;
}

export async function addItemToOrder(id: number, item: SupplierOrderItem): Promise<SupplierOrder> {
  const idx = orders.findIndex(o => o.id === id);
  if (idx === -1) throw new Error('Not found');
  const existing = orders[idx].items.findIndex(i => i.bookId === item.bookId);
  if (existing >= 0) {
    orders[idx].items[existing].quantity += item.quantity;
  } else {
    orders[idx].items.push(item);
  }
  orders[idx].total = orders[idx].items.reduce((s, i) => s + i.quantity * i.pricePerUnit, 0);
  return orders[idx];
}

export async function removeItemFromOrder(id: number, bookId: number): Promise<SupplierOrder> {
  const idx = orders.findIndex(o => o.id === id);
  if (idx === -1) throw new Error('Not found');
  orders[idx].items = orders[idx].items.filter(i => i.bookId !== bookId);
  orders[idx].total = orders[idx].items.reduce((s, i) => s + i.quantity * i.pricePerUnit, 0);
  return orders[idx];
}

export async function updateSupplierOrderStatus(id: number, status: SupplierOrderStatus): Promise<SupplierOrder> {
  const idx = orders.findIndex(o => o.id === id);
  if (idx === -1) throw new Error('Not found');
  orders[idx] = { ...orders[idx], status };
  return orders[idx];
}

export function generateSupplierCSV(order: SupplierOrder): string {
  const headers = ['Назва', 'Кількість', 'Ціна за од.', 'Сума'];
  const rows = order.items.map(i => [
    `"${i.title}"`, String(i.quantity), String(i.pricePerUnit), String(i.quantity * i.pricePerUnit),
  ]);
  rows.push(['', '', 'РАЗОМ:', String(order.total)]);
  return [
    `Постачальник: ${order.supplier}`,
    `Email: ${order.supplierEmail}`,
    `Дата: ${new Date(order.createdAt).toLocaleDateString('uk-UA')}`,
    `Примітка: ${order.note || '—'}`,
    '',
    headers.join(','),
    ...rows.map(r => r.join(',')),
  ].join('\n');
}