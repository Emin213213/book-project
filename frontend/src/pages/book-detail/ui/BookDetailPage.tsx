import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useBookQuery } from '@/modules/book';
import { useFavoritesStore } from '@/modules/favorite';
import { useCartStore } from '@/modules/cart';
import { useStockSubscriptionsStore } from '@/modules/stock-subscription';
import { getEffectivePrice, getDiscountPercent, isDiscountActive } from '@/modules/book';
import Loader from '@/shared/ui/Loader.tsx';
import EmptyState from '@/shared/ui/EmptyState.tsx';
import Icon from '@/shared/ui/Icon.tsx';
import styles from './BookDetailPage.module.css';

export default function BookDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const bookId = id ? Number(id) : undefined;
  const bookQuery = useBookQuery(bookId);
  const book = bookQuery.data;
  const { toggle, isFavorite } = useFavoritesStore();
  const { addItem, getQuantity } = useCartStore();
  const { subscribe, unsubscribe, isSubscribed } = useStockSubscriptionsStore();
  const [timeLeft, setTimeLeft] = useState('');

  const discountEndsAt = book?.discount && isDiscountActive(book.discount)
    ? book.discount.endsAt
    : undefined;

  useEffect(() => {
    if (!discountEndsAt) {
      return;
    }

    const tick = () => {
      const diff = new Date(discountEndsAt).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft(''); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(`${d > 0 ? d + 'д ' : ''}${h}год ${m}хв`);
    };
    tick();
    const iv = setInterval(tick, 60000);
    return () => clearInterval(iv);
  }, [discountEndsAt]);

  if (bookQuery.isPending) return <Loader />;
  if (!book) return <EmptyState message="Книгу не знайдено" />;

  const favorite = isFavorite(book.id);
  const inCart = getQuantity(book.id) > 0;
  const outOfStock = book.stock <= 0;
  const subscribed = isSubscribed(book.id);
  const discountPercent = getDiscountPercent(book);
  const effectivePrice = getEffectivePrice(book);
  const hasDiscount = discountPercent !== null;

  return (
    <article>
      <h1 className={styles.title}>{book.title}</h1>

      <div className={styles.top}>
        <div className={styles.cover}>
          <img src={book.coverUrl} alt={book.title} />
          {outOfStock && <div className={styles.outBadge}>Немає в наявності</div>}
          {hasDiscount && !outOfStock && <div className={styles.discountBadge}>-{discountPercent}%</div>}
        </div>
        <div className={styles.info}>
          <p className={styles.meta}>Автор: <Link to={`/author/${book.authorId}`} className={styles.authorLink}>{book.author}</Link></p>
          <p className={styles.meta}>Категорія: <strong>{book.category}</strong></p>
          <p className={styles.meta}>Перша публікація: <strong>{book.year}</strong></p>
          <p className={styles.meta}>Кількість сторінок: <strong>{book.pages}</strong></p>

          <div className={styles.priceBlock}>
            {hasDiscount ? (
              <>
                <span className={styles.priceOld}>{book.price} ₴</span>
                <span className={styles.priceSale}>{effectivePrice} ₴</span>
                <span className={styles.saveBadge}>Економія {book.price - effectivePrice} ₴</span>
              </>
            ) : (
              <span className={`${styles.price} ${outOfStock ? styles.priceOut : ''}`}>{book.price} ₴</span>
            )}
          </div>

          {hasDiscount && timeLeft && (
            <div className={styles.timerBlock}>
              <Icon name="timer" />
              <span>Акція закінчиться через <strong>{timeLeft}</strong></span>
            </div>
          )}

          {outOfStock && <span className={styles.stockLabel}>Тимчасово відсутня</span>}

          {outOfStock ? (
            <div className={styles.actions}>
              <button
                className={`${styles.btnNotify} ${subscribed ? styles.btnNotifyActive : ''}`}
                onClick={() => subscribed ? unsubscribe(book.id) : subscribe(book.id)}
              >
                <Icon name={subscribed ? 'notifications_active' : 'notifications_none'} />
                {subscribed ? 'Ви підписані — повідомимо' : 'Повідомити про наявність'}
              </button>
              <button
                className={`${styles.btnFavorite} ${favorite ? styles.btnFavoriteActive : ''}`}
                onClick={() => toggle(book.id)}
              >
                <Icon name={favorite ? 'bookmark' : 'bookmark_border'} />
              </button>
            </div>
          ) : (
            <div className={styles.actions}>
              <button
                className={`${styles.btnBuy} ${inCart ? styles.btnBuyInCart : ''}`}
                onClick={() => {
                  if (inCart) navigate('/cart');
                  else { addItem(book.id); navigate('/cart'); }
                }}
              >
                <Icon name="shopping_cart" />
                {inCart ? 'Перейти в кошик' : 'Купити'}
              </button>
              <button
                className={styles.btnAddCart}
                onClick={() => addItem(book.id)}
                disabled={inCart}
              >
                <Icon name={inCart ? 'check' : 'add_shopping_cart'} />
                {inCart ? 'У кошику' : 'У кошик'}
              </button>
              <button
                className={`${styles.btnFavorite} ${favorite ? styles.btnFavoriteActive : ''}`}
                onClick={() => toggle(book.id)}
              >
                <Icon name={favorite ? 'bookmark' : 'bookmark_border'} />
              </button>
            </div>
          )}
        </div>
      </div>

      {book.description && (
        <div className={styles.description}>
          <h3>Опис:</h3>
          <p>{book.description}</p>
        </div>
      )}

      {book.tags.length > 0 && (
        <div className={styles.tagsSection}>
          <h3>Теги:</h3>
          <div className={styles.tags}>
            {book.tags.map((tag) => (
              <span key={tag} className={styles.tag}>{tag}</span>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
