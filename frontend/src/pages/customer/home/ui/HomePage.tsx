import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { BookCard, BookGrid } from '@/modules/book';
import { useCartStore } from '@/modules/cart';
import { useFavoritesStore } from '@/modules/favorite';
import { useStockSubscriptionsStore } from '@/modules/stock-subscription';
import EmptyState from '@/shared/ui/EmptyState.tsx';
import Loader from '@/shared/ui/Loader.tsx';
import Pagination from '@/shared/ui/Pagination.tsx';
import SearchBar from '@/shared/ui/SearchBar.tsx';
import { useAuthActionNotice } from '../model/use-auth-action-notice';
import { useHomeListParams } from '../model/use-home-list-params';



export default function HomePage() {



  useAuthActionNotice();
  const { search, page, limit, setPage, setSearch, books, total, isPending } = useHomeListParams();
  const { toggle, isFavorite } = useFavoritesStore();
  const { addItem, getQuantity } = useCartStore();
  const { isSubscribed, subscribe, unsubscribe } = useStockSubscriptionsStore();

  const navigate = useNavigate();


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

  const [initialSearch] = useState(search);

  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <section>
        <SearchBar initialValue={initialSearch} onSearch={setSearch} />
      </section>

      {isPending ? (
        <Loader />
      ) : books.length === 0 ? (
        <EmptyState message="Книги не найдены" />
      ) : (
        <>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '20px 0' }}>
            {search ? `Результаты поиска: "${search}"` : 'Все книги'}
          </h2>
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
          {totalPages > 1 && (
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          )}
        </>
      )}
    </>
  );
}
