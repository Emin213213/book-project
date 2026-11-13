import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/modules/cart';
import { useFavoritesStore } from '@/modules/favorite';
import { useStockSubscriptionsStore } from '@/modules/stock-subscription';
import { useAllBooksQuery } from '@/modules/book';
import Loader from '@/shared/ui/Loader.tsx';
import EmptyState from '@/shared/ui/EmptyState.tsx';
import { BookCard, BookGrid } from '@/modules/book';

export default function FavoritesPage() {
  const navigate = useNavigate();
  const { ids, toggle, isFavorite } = useFavoritesStore();
  const { addItem, getQuantity } = useCartStore();
  const { isSubscribed, subscribe, unsubscribe } = useStockSubscriptionsStore();
  const { books: allBooks, isPending } = useAllBooksQuery();
  const books = allBooks.filter(book => ids.includes(book.id));

  const handleCartAction = (bookId: number) => {
    if (getQuantity(bookId) > 0) {
      navigate('/cart');
      return;
    }

    addItem(bookId);
  };

  const handleSubscription = (bookId: number) => {
    if (isSubscribed(bookId)) {
      unsubscribe(bookId);
      return;
    }

    subscribe(bookId);
  };

  if (isPending) return <Loader />;

  return (
    <>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 20 }}>
        Избранные книги
      </h2>
      {books.length === 0 ? (
        <EmptyState icon="bookmark_border" message="У вас пока нет избранных книг" />
      ) : (
        <BookGrid>
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              isFavorite={isFavorite(book.id)}
              isInCart={getQuantity(book.id) > 0}
              isSubscribed={isSubscribed(book.id)}
              onCartAction={handleCartAction}
              onOpen={(bookId) => navigate(`/book/${bookId}`)}
              onToggleSubscription={handleSubscription}
              onToggleFavorite={toggle}
            />
          ))}
        </BookGrid>
      )}
    </>
  );
}
