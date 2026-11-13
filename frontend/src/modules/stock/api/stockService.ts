import type { StockEntry } from '../model/stock.types';

const INITIAL_STOCK = [
  { bookId: 1, quantity: 12 },
  { bookId: 2, quantity: 12 },
  { bookId: 3, quantity: 12 },
  { bookId: 4, quantity: 12 },
  { bookId: 5, quantity: 0 },
  { bookId: 6, quantity: 12 },
  { bookId: 7, quantity: 12 },
  { bookId: 8, quantity: 12 },
  { bookId: 9, quantity: 0 },
  { bookId: 10, quantity: 12 },
] as const;

// Stock entries log
const entries: StockEntry[] = [
  { id: 1, bookId: 1, bookTitle: 'Властелин колец', quantity: 10, type: 'restock', supplier: 'BookWholesale UA', note: 'Початкова поставка', createdAt: '2026-03-01T10:00:00.000Z' },
  { id: 2, bookId: 6, bookTitle: 'Гарри Поттер и философский камень', quantity: 8, type: 'restock', supplier: 'BookWholesale UA', note: '', createdAt: '2026-03-05T14:00:00.000Z' },
  { id: 3, bookId: 5, bookTitle: '1984', quantity: -5, type: 'adjustment', supplier: '', note: 'Пошкоджені при транспортуванні', createdAt: '2026-03-20T09:00:00.000Z' },
  { id: 4, bookId: 2, bookTitle: 'Игра престолов', quantity: 15, type: 'restock', supplier: 'Librex', note: 'Дозамовлення', createdAt: '2026-03-25T11:00:00.000Z' },
];
let nextId = 5;

// In-memory stock (separate from books.json for mutation)
const stockMap = new Map<number, number>();
for (const stockEntry of INITIAL_STOCK) {
  stockMap.set(stockEntry.bookId, stockEntry.quantity);
}

export async function getStock(): Promise<Map<number, number>> {
  return new Map(stockMap);
}

export async function getStockForBook(bookId: number): Promise<number> {
  return stockMap.get(bookId) ?? 0;
}

export async function addStockEntry(data: Omit<StockEntry, 'id' | 'createdAt'>): Promise<StockEntry> {
  const entry: StockEntry = { ...data, id: nextId++, createdAt: new Date().toISOString() };
  entries.push(entry);
  // Update stock
  const current = stockMap.get(data.bookId) ?? 0;
  stockMap.set(data.bookId, Math.max(0, current + data.quantity));
  return entry;
}

export async function getStockEntries(bookId?: number): Promise<StockEntry[]> {
  const filtered = bookId ? entries.filter(e => e.bookId === bookId) : entries;
  return [...filtered].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
