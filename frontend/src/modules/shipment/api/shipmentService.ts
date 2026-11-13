import type { Shipment, PackingListOrder, ShipmentItem, ShipmentStatus } from '../model/shipment.types';

const shipments: Shipment[] = [
  {
    id: 1,
    name: 'Відправка 28.03 — Нова Пошта',
    orders: [
      { orderId: 2, customerName: 'Марія Петрова', customerPhone: '+380 (67) 222-33-44', city: 'Київ', warehouse: 'Відділення №5',
        items: [
          { bookId: 6, title: 'Гарри Поттер и философский камень', quantity: 1, packed: true },
          { bookId: 2, title: 'Игра престолов', quantity: 1, packed: true },
          { bookId: 8, title: 'Дюна', quantity: 1, packed: false },
        ], packed: false },
      { orderId: 3, customerName: 'Дмитро Козлов', customerPhone: '', city: 'Львів', warehouse: 'Відділення №12',
        items: [{ bookId: 4, title: 'The Picture of Dorian Gray', quantity: 1, packed: false }], packed: false },
    ],
    status: 'packing', carrier: 'nova-poshta', missingItems: [], note: '', createdAt: '2026-03-28T12:00:00.000Z',
  },
  {
    id: 2,
    name: 'Відправка 15.03 — Нова Пошта',
    orders: [
      { orderId: 1, customerName: 'Олексій Іванов', customerPhone: '+380 (93) 555-12-34', city: 'Одеса', warehouse: 'Відділення №3',
        items: [
          { bookId: 1, title: 'Властелин колец', quantity: 1, packed: true },
          { bookId: 5, title: '1984', quantity: 2, packed: true },
        ], packed: true },
    ],
    status: 'shipped', carrier: 'nova-poshta', missingItems: [], note: 'ТТН: 20450000012345', createdAt: '2026-03-15T14:00:00.000Z',
  },
];

let nextShipId = 3;

export async function getShipments(): Promise<Shipment[]> {
  return [...shipments].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function createShipment(name: string, orders: PackingListOrder[], carrier: Shipment['carrier']): Promise<Shipment> {
  const shipment: Shipment = { id: nextShipId++, name, orders, status: 'draft', carrier, missingItems: [], note: '', createdAt: new Date().toISOString() };
  shipments.push(shipment);
  return shipment;
}

export async function updateShipmentStatus(id: number, status: ShipmentStatus): Promise<Shipment> {
  const idx = shipments.findIndex(s => s.id === id);
  if (idx === -1) throw new Error('Not found');
  shipments[idx] = { ...shipments[idx], status };
  return shipments[idx];
}

export async function updateShipmentNote(id: number, note: string): Promise<Shipment> {
  const idx = shipments.findIndex(s => s.id === id);
  if (idx === -1) throw new Error('Not found');
  shipments[idx] = { ...shipments[idx], note };
  return shipments[idx];
}

export async function toggleItemPacked(shipmentId: number, orderId: number, bookId: number): Promise<Shipment> {
  const idx = shipments.findIndex(s => s.id === shipmentId);
  if (idx === -1) throw new Error('Not found');
  shipments[idx] = {
    ...shipments[idx],
    orders: shipments[idx].orders.map(o =>
      o.orderId === orderId
        ? { ...o, items: o.items.map(i => i.bookId === bookId ? { ...i, packed: !i.packed } : i) }
        : o
    ),
  };
  // Auto-set order packed if all items packed
  shipments[idx].orders = shipments[idx].orders.map(o => ({ ...o, packed: o.items.every(i => i.packed) }));
  return shipments[idx];
}

export async function markMissing(shipmentId: number, missingItems: ShipmentItem[]): Promise<Shipment> {
  const idx = shipments.findIndex(s => s.id === shipmentId);
  if (idx === -1) throw new Error('Not found');
  shipments[idx] = { ...shipments[idx], missingItems, status: 'packing' };
  return shipments[idx];
}

export function generateCSV(shipment: Shipment): string {
  const headers = ['Замовлення', 'Отримувач', 'Телефон', 'Місто', 'Відділення', 'Опис вмісту', 'Кількість місць', 'Вага (кг)'];
  const rows = shipment.orders.map(o => {
    const desc = o.items.map(i => `${i.title} x${i.quantity}`).join('; ');
    const totalQty = o.items.reduce((s, i) => s + i.quantity, 0);
    const weight = (totalQty * 0.5).toFixed(1);
    return [`#${o.orderId}`, o.customerName, o.customerPhone, o.city, o.warehouse, `"${desc}"`, '1', weight];
  });
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
