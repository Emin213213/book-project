import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAuthorById } from '@/modules/author';
import { useAllBooksQuery } from '@/modules/book';
import { useCartStore } from '@/modules/cart';
import { useFavoritesStore } from '@/modules/favorite';
import { useStockSubscriptionsStore } from '@/modules/stock-subscription';
import type { Author } from '@/modules/author';
import Loader from '@/shared/ui/Loader.tsx';
import EmptyState from '@/shared/ui/EmptyState.tsx';
import { BookCard, BookGrid } from '@/modules/book';
import styles from './AuthorPage.module.css';

export default function AuthorPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toggle, isFavorite } = useFavoritesStore();
  const { addItem, getQuantity } = useCartStore();
  const { isSubscribed, subscribe, unsubscribe } = useStockSubscriptionsStore();
  const [author, setAuthor] = useState<Author | null>(null);
  const { books: allBooks, isPending: areBooksPending } = useAllBooksQuery();
  const [loading, setLoading] = useState(true);
  const books = author ? allBooks.filter(book => book.authorId === author.id) : [];

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

  useEffect(() => {
    if (!id) return;
    getAuthorById(Number(id)).then(authorData => {
      setAuthor(authorData ?? null);
      setLoading(false);
    });
  }, [id]);

  if (loading || areBooksPending) return <Loader />;
  if (!author) return <EmptyState message="Автор не найден" />;

  const initials = author.name
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <>
      <div className={styles.header}>
        {author.photo ? (
          <img src={author.photo} alt={author.name} className={styles.avatar} />
        ) : (
          <div className={styles.avatarFallback}>{initials}</div>
        )}
        <div className={styles.info}>
          <h1 className={styles.name}>{author.name}</h1>
          <div className={styles.meta}>
            {author.country && <span>{author.country}</span>}
            {author.birthYear > 0 && <span>род. {author.birthYear}</span>}
            <span>{books.length} {books.length === 1 ? 'книга' : books.length < 5 ? 'книги' : 'книг'}</span>
          </div>
        </div>
      </div>

      <h2 className={styles.sectionTitle}>Книги автора</h2>

      {books.length === 0 ? (
        <EmptyState icon="menu_book" message="У этого автора пока нет книг" />
      ) : (
        <BookGrid>
          {books.map(book => (
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
