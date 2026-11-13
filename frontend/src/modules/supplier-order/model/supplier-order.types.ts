export interface SupplierOrderItem {
  bookId: number;
  title: string;
  quantity: number;
  pricePerUnit: number;
}

export type SupplierOrderStatus = 'draft' | 'sent' | 'confirmed' | 'shipped' | 'received';

export interface SupplierOrder {
  id: number;
  supplier: string;
  supplierEmail: string;
  items: SupplierOrderItem[];
  status: SupplierOrderStatus;
  note: string;
  total: number;
  createdAt: string;
}
