import { create } from 'zustand';
import type { ReplaceRequest, ReplaceRequestStatus } from './replace-request.types';
import * as service from '../api/replaceRequestService.ts';

interface ReplaceRequestsState {
  requests: ReplaceRequest[];
  loading: boolean;
  fetchRequests: () => Promise<void>;
  fetchByOrderId: (orderId: number) => Promise<ReplaceRequest[]>;
  createRequest: (data: Omit<ReplaceRequest, 'id' | 'status' | 'createdAt'>) => Promise<ReplaceRequest>;
  updateStatus: (id: number, status: ReplaceRequestStatus) => Promise<void>;
}

export const useReplaceRequestsStore = create<ReplaceRequestsState>()((set) => ({
  requests: [],
  loading: false,

  fetchRequests: async () => {
    set({ loading: true });
    const requests = await service.getRequests();
    set({ requests, loading: false });
  },

  fetchByOrderId: async (orderId) => {
    return service.getRequestsByOrderId(orderId);
  },

  createRequest: async (data) => {
    return service.createRequest(data);
  },

  updateStatus: async (id, status) => {
    await service.updateRequestStatus(id, status);
  },
}));