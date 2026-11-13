import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '@/modules/cart';
import { useAllBooksQuery } from '@/modules/book';
import type { Book } from '@/modules/book';
import { getEffectivePrice, getDiscountPercent } from '@/modules/book';
import EmptyState from '@/shared/ui/EmptyState.tsx';
import Icon from '@/shared/ui/Icon.tsx';
import styles from './CartPage.module.css';

export default function CartPage() {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, clear } = useCartStore();
  const { books } = useAllBooksQuery();

  const cartBooks = items
    .map(item => {
      const book = books.find(b => b.id === item.bookId);
      return book ? { ...item, book } : null;
    })
    .filter(Boolean) as { bookId: number; quantity: number; book: Book }[];

  const total = cartBooks.reduce((sum, item) => sum + getEffectivePrice(item.book) * item.quantity, 0);

  if (items.length === 0) {
    return (
      <>
        <h2 className={styles.pageTitle}>Корзина</h2>
        <EmptyState icon="shopping_cart" message="Ваша корзина пуста" />
        <div className={styles.emptyAction}>
          <Link to="/" className={styles.continueLink}>
            <Icon name="arrow_back" />
            Перейти к каталогу
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <div className={styles.header}>
        <h2 className={styles.pageTitle}>Корзина</h2>
        <button className={styles.clearBtn} onClick={clear}>
          <Icon name="delete_outline" />
          Очистить
        </button>
      </div>

      <div className={styles.list}>
        {cartBooks.map(({ book, quantity }) => (
          <div key={book.id} className={styles.item}>
            <Link to={`/book/${book.id}`} className={styles.itemCover}>
              <img src={book.coverUrl} alt={book.title} />
            </Link>
            <div className={styles.itemInfo}>
              <Link to={`/book/${book.id}`} className={styles.itemTitle}>{book.title}</Link>
              <span className={styles.itemAuthor}>{book.author}</span>
              <span className={styles.itemPrice}>
                {getDiscountPercent(book) !== null ? <><s style={{color:'var(--text-muted)',marginRight:4}}>{book.price}</s>{getEffectivePrice(book)}</> : book.price} ₴
              </span>
            </div>
            <div className={styles.itemQty}>
              <button
                className={styles.qtyBtn}
                onClick={() => updateQuantity(book.id, quantity - 1)}
              >
                <Icon name="remove" />
              </button>
              <span className={styles.qtyValue}>{quantity}</span>
              <button
                className={styles.qtyBtn}
                onClick={() => updateQuantity(book.id, quantity + 1)}
              >
                <Icon name="add" />
              </button>
            </div>
            <span className={styles.itemTotal}>{getEffectivePrice(book) * quantity} ₴</span>
            <button className={styles.removeBtn} onClick={() => removeItem(book.id)}>
              <Icon name="close" />
            </button>
          </div>
        ))}
      </div>

      <div className={styles.summary}>
        <div className={styles.summaryRow}>
          <span>Итого ({items.reduce((s, i) => s + i.quantity, 0)} шт.)</span>
          <span className={styles.summaryTotal}>{total} &#8372;</span>
        </div>
        <button className={styles.checkoutBtn} onClick={() => navigate('/checkout')}>
          Оформить заказ
          <Icon name="arrow_forward" />
        </button>
      </div>
    </>
  );
}
