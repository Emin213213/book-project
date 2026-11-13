import type { Book, BookDiscount } from '../model/book.types';

export function isDiscountActive(discount: BookDiscount | null): boolean {
  if (!discount) return false;
  return new Date() < new Date(discount.endsAt);
}

export function getEffectivePrice(book: Book): number {
  if (book.discount && isDiscountActive(book.discount)) {
    return Math.round(book.price * (1 - book.discount.percent / 100));
  }
  return book.price;
}

export function getDiscountPercent(book: Book): number | null {
  if (book.discount && isDiscountActive(book.discount)) {
    return book.discount.percent;
  }
  return null;
}
