import {Link, useNavigate, useParams} from 'react-router-dom';

import {
    BookForm,
    useAdminBookQuery,
    useAdminBookReferencesQuery,
    useDeleteBookMutation,
    useUpdateBookMutation
} from '@/modules/book';
import AdminCard from '@/shared/ui/admin-card/AdminCard.tsx';
import AdminHeader from '@/shared/ui/admin-header/AdminHeader.tsx';
import EmptyState from '@/shared/ui/EmptyState.tsx';
import Icon from '@/shared/ui/Icon.tsx';
import Loader from '@/shared/ui/Loader.tsx';

import styles from './BookEditPage.module.css';

export default function BookEditPage(): React.JSX.Element {
    const {slug} = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const {data:book,isPending,isError} = useAdminBookQuery(slug);
    const updateBook = useUpdateBookMutation();
    const deleteBook = useDeleteBookMutation();
    const referencesQuery = useAdminBookReferencesQuery();

    if (isPending) return <Loader/>;
    if (isError || !book) return <EmptyState message="Не удалось загрузить книгу"/>;

    const isSubmitting = updateBook.isPending || deleteBook.isPending;

    return <>
        <AdminHeader title="">
            <div className={styles.breadcrumb}>
                <Link to="/admin/books" className={styles.breadcrumbLink}>Книги</Link>
                <Icon name="chevron_right" className={styles.breadcrumbSep}/>
                <span className={styles.breadcrumbCurrent}>{book.title}</span>
            </div>
        </AdminHeader>
        <AdminCard title="Редактировать книгу" icon="edit">
            <BookForm initialData={book} authors={referencesQuery.data.authors.map(author => ({
                id: author.id,
                name: `${author.firstName} ${author.lastName}`
            }))}
                      categories={referencesQuery.data.categories.map(category => ({
                          id: String(category.id),
                          name: category.title
                      }))} isSubmitting={isSubmitting}
                      onSubmit={async data => {
                          await updateBook.mutateAsync({
                              slug: book.slug,
                              data
                          });
                          navigate('/admin/books');
                      }} onDelete={async () => {
                await deleteBook.mutateAsync(book.slug);
                navigate('/admin/books');
            }}/></AdminCard></>;
}
