export interface StockEntry {
  id: number;
  bookId: number;
  bookTitle: string;
  quantity: number;
  type: 'restock' | 'adjustment' | 'return';
  supplier: string;
  note: string;
  createdAt: string;
}
