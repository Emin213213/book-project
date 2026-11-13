import { create } from 'zustand';
import type { Shipment, PackingListOrder, ShipmentItem, ShipmentStatus } from './shipment.types';
import * as service from '../api/shipmentService.ts';

interface ShipmentsState {
  shipments: Shipment[];
  loading: boolean;
  fetchShipments: () => Promise<void>;
  createShipment: (name: string, orders: PackingListOrder[], carrier: Shipment['carrier']) => Promise<Shipment>;
  updateStatus: (id: number, status: ShipmentStatus) => Promise<void>;
  updateNote: (id: number, note: string) => Promise<void>;
  toggleItemPacked: (shipmentId: number, orderId: number, bookId: number) => Promise<void>;
  markMissing: (shipmentId: number, missingItems: ShipmentItem[]) => Promise<void>;
}

export const useShipmentsStore = create<ShipmentsState>()((set) => ({
  shipments: [],
  loading: false,

  fetchShipments: async () => {
    set({ loading: true });
    const shipments = await service.getShipments();
    set({ shipments, loading: false });
  },

  createShipment: async (name, orders, carrier) => service.createShipment(name, orders, carrier),
  updateStatus: async (id, status) => { await service.updateShipmentStatus(id, status); },
  updateNote: async (id, note) => { await service.updateShipmentNote(id, note); },
  toggleItemPacked: async (shipmentId, orderId, bookId) => { await service.toggleItemPacked(shipmentId, orderId, bookId); },
  markMissing: async (shipmentId, missingItems) => { await service.markMissing(shipmentId, missingItems); },
}));