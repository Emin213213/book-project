import type { ReplaceRequest, ReplaceRequestStatus } from '../model/replace-request.types';
import initialRequests from './replaceRequests.json';

const requests: ReplaceRequest[] = [...initialRequests] as ReplaceRequest[];
let nextId = Math.max(0, ...requests.map(r => r.id)) + 1;

export async function getRequests(): Promise<ReplaceRequest[]> {
  return [...requests].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getRequestsByOrderId(orderId: number): Promise<ReplaceRequest[]> {
  return requests.filter(r => r.orderId === orderId);
}

export async function createRequest(data: Omit<ReplaceRequest, 'id' | 'status' | 'createdAt'>): Promise<ReplaceRequest> {
  const request: ReplaceRequest = {
    ...data,
    id: nextId++,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  requests.push(request);
  return request;
}

export async function updateRequestStatus(id: number, status: ReplaceRequestStatus): Promise<ReplaceRequest> {
  const idx = requests.findIndex(r => r.id === id);
  if (idx === -1) throw new Error('Request not found');
  requests[idx] = { ...requests[idx], status };
  return requests[idx];
}