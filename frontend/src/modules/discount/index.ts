export {
  applyDiscount,
  createDiscount,
  deleteDiscount,
  getDiscountByCode,
  getDiscounts,
  updateDiscount,
} from './api/discountService';
export type { Discount } from './model/discount.types';
export { useDiscountsStore } from './model/useDiscountsStore';
