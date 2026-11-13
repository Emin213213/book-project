import type { Book } from '../model/book.types';
import Icon from '@/shared/ui/Icon.tsx';
import { getDiscountPercent, getEffectivePrice } from '../lib/price';
import styles from './BookCard.module.css';

interface BookCardProps {
  book: Book;
  isFavorite: boolean;
  isInCart: boolean;
  isSubscribed: boolean;
  onCartAction: (id: number) => void;
  onOpen: (id: number) => void;
  onToggleSubscription: (id: number) => void;
  onToggleFavorite: (id: number) => void;
}

export default function BookCard({
  book,
  isFavorite,
  isInCart,
  isSubscribed,
  onCartAction,
  onOpen,
  onToggleFavorite,
  onToggleSubscription,
}: BookCardProps) {
  const outOfStock = book.stock <= 0;
  const discountPercent = getDiscountPercent(book);
  const effectivePrice = getEffectivePrice(book);
  const hasDiscount = discountPercent !== null;

  return (
    <div className={styles.card} onClick={() => onOpen(book.id)}>
      <div className={styles.cover}>
        <img src={book.coverUrl} alt={book.title} />
        {outOfStock && <div className={styles.outBadge}>Немає в наявності</div>}
        {hasDiscount && !outOfStock && <div className={styles.discountBadge}>-{discountPercent}%</div>}
      </div>
      <div className={styles.body}>
        <span className={styles.category}>{book.category}</span>
        <h3 className={styles.title}>{book.title}</h3>
        <span className={styles.author}>{book.author}</span>
        <div className={styles.priceRow}>
          {hasDiscount ? (
            <>
              <span className={styles.priceOld}>{book.price} ₴</span>
              <span className={styles.priceSale}>{effectivePrice} ₴</span>
            </>
          ) : (
            <span className={`${styles.price} ${outOfStock ? styles.priceOut : ''}`}>{book.price} ₴</span>
          )}
        </div>
        <div className={styles.footer}>
          {outOfStock ? (
            <button
              className={`${styles.notifyBtn} ${isSubscribed ? styles.notifyBtnActive : ''}`}
              onClick={(event) => {
                event.stopPropagation();
                onToggleSubscription(book.id);
              }}
              title={isSubscribed ? 'Відписатися' : 'Повідомити про наявність'}
            >
              <Icon name={isSubscribed ? 'notifications_active' : 'notifications_none'} />
            </button>
          ) : (
            <button
              className={`${styles.cartBtn} ${isInCart ? styles.cartBtnActive : ''}`}
              onClick={(event) => {
                event.stopPropagation();
                onCartAction(book.id);
              }}
            >
              <Icon name={isInCart ? 'check' : 'shopping_cart'} />
            </button>
          )}
          <button
            className={`${styles.bookmark} ${isFavorite ? styles.bookmarkActive : ''}`}
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(book.id); }}
          >
            <Icon name={isFavorite ? 'bookmark' : 'bookmark_border'} />
          </button>
        </div>
      </div>
    </div>
  );
}
