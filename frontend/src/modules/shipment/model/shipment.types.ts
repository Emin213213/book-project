export type ShipmentStatus = 'draft' | 'packing' | 'ready' | 'shipped' | 'delivered';

export interface ShipmentItem {
  bookId: number;
  title: string;
  quantity: number;
  packed: boolean;
}

export interface PackingListOrder {
  orderId: number;
  customerName: string;
  customerPhone: string;
  city: string;
  warehouse: string;
  items: ShipmentItem[];
  packed: boolean;
}

export interface Shipment {
  id: number;
  name: string;
  orders: PackingListOrder[];
  status: ShipmentStatus;
  carrier: 'nova-poshta' | 'ukrposhta';
  missingItems: ShipmentItem[];
  note: string;
  createdAt: string;
}
