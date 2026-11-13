export type ReplaceRequestStatus = 'pending' | 'approved' | 'rejected';

export interface ReplaceRequest {
  id: number;
  orderId: number;
  itemIndex: number;
  oldTitle: string;
  oldPrice: number;
  newBookId: number;
  newTitle: string;
  newPrice: number;
  reason: string;
  status: ReplaceRequestStatus;
  createdAt: string;
}
