export interface Discount {
  id: number;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  minOrder: number;
  maxUses: number;
  usedCount: number;
  categoryId: number | null;
  active: boolean;
  startsAt: string;
  endsAt: string;
}
