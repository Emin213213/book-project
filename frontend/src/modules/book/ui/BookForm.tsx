import {useState, type FormEvent} from 'react';

import CustomSelect from '@/shared/ui/CustomSelect.tsx';
import Icon from '@/shared/ui/Icon.tsx';

import type {AdminBook, AdminBookInput} from '../model/admin-book.types';
import styles from './BookForm.module.css';

export interface BookFormOption {
    readonly id: string;
    readonly name: string;
}

interface BookFormProps {
    initialData?: AdminBook;
    authors: readonly BookFormOption[];
    categories: readonly BookFormOption[];
    isSubmitting?: boolean;
    onSubmit: (data: AdminBookInput) => void;
    onDelete?: () => void;
}

/** Редактирует поля, определённые CreateBookDto и UpdateBookDto. */
export default function BookForm({
                                     initialData,
                                     authors,
                                     categories,
                                     isSubmitting = false,
                                     onSubmit,
                                     onDelete
                                 }: BookFormProps): React.JSX.Element {
    const [title, setTitle] = useState(initialData?.title ?? '');
    const [slug, setSlug] = useState(initialData?.slug ?? '');
    const [isbn, setIsbn] = useState(initialData?.isbn ?? '');
    const [authorId, setAuthorId] = useState(initialData?.authors[0]?.id ?? '');
    const [categoryId, setCategoryId] = useState(String(initialData?.category.id ?? ''));
    const [year, setYear] = useState(initialData?.year ?? 0);
    const [pages, setPages] = useState(initialData?.pages ?? 0);
    const [price, setPrice] = useState(initialData?.price ?? 0);
    const [quantity, setQuantity] = useState(initialData?.quantity ?? 0);
    const [description, setDescription] = useState(initialData?.description ?? '');
    const [cover, setCover] = useState<File>();

    const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        onSubmit({
            title,
            slug,
            isbn,
            authorIds: [authorId],
            categoryId,
            year,
            pages,
            price,
            quantity,
            description,
            cover
        });
    };

    return (
        <form
            className={styles.form}
            onSubmit={handleSubmit}
        >
            <div className={styles.grid}>
                <label className={`${styles.group} ${styles.groupFull}`}><span className={styles.label}>Название *</span><input
                    className={styles.input}
                    value={title}
                    onChange={event => setTitle(event.target.value)}
                    required
                /></label>
                <label className={styles.group}><span className={styles.label}>Slug *</span><input
                    className={styles.input}
                    value={slug}
                    onChange={event => setSlug(event.target.value)}
                    required
                /></label>
                <label className={styles.group}><span className={styles.label}>ISBN *</span><input
                    className={styles.input}
                    value={isbn}
                    onChange={event => setIsbn(event.target.value)}
                    required
                /></label>
                <div className={styles.group}><span className={styles.label}>Автор *</span><CustomSelect
                    options={authors.map(author => ({
                        value: author.id,
                        label: author.name
                    }))}
                    value={authorId}
                    onChange={value => setAuthorId(String(value))}
                    placeholder="Выберите автора"
                    required
                /></div>
                <div className={styles.group}><span className={styles.label}>Категория *</span><CustomSelect
                    options={categories.map(category => ({
                        value: category.id,
                        label: category.name
                    }))}
                    value={categoryId}
                    onChange={value => setCategoryId(String(value))}
                    placeholder="Выберите категорию"
                    required
                /></div>
                <label className={styles.group}><span className={styles.label}>Год *</span><input
                    className={styles.input}
                    type="number"
                    min="1"
                    value={year || ''}
                    onChange={event => setYear(Number(event.target.value))}
                    required
                /></label>
                <label className={styles.group}><span className={styles.label}>Страниц *</span><input
                    className={styles.input}
                    type="number"
                    min="1"
                    value={pages || ''}
                    onChange={event => setPages(Number(event.target.value))}
                    required
                /></label>
                <label className={styles.group}><span className={styles.label}>Цена (₴) *</span><input
                    className={styles.input}
                    type="number"
                    min="1"
                    value={price || ''}
                    onChange={event => setPrice(Number(event.target.value))}
                    required
                /></label>
                <label className={styles.group}><span className={styles.label}>Количество *</span><input
                    className={styles.input}
                    type="number"
                    min="1"
                    value={quantity || ''}
                    onChange={event => setQuantity(Number(event.target.value))}
                    required
                /></label>
                <label className={`${styles.group} ${styles.groupFull}`}><span className={styles.label}>Описание *</span><textarea
                    className={styles.textarea}
                    rows={5}
                    value={description}
                    onChange={event => setDescription(event.target.value)}
                    required
                /></label>
                <label className={`${styles.group} ${styles.groupFull}`}><span className={styles.label}>Файл обложки</span><input
                    className={styles.input}
                    type="file"
                    accept="image/*"
                    onChange={event => setCover(event.target.files?.[0])}
                />{initialData?.cover && !cover && <span className={styles.hint}>Текущая обложка сохранится</span>}
                </label>
            </div>
            <div className={styles.actions}>
                {onDelete && <button
                    type="button"
                    className={styles.btnDanger}
                    onClick={onDelete}
                    disabled={isSubmitting}
                ><Icon name="delete_outline"/> Удалить</button>}
                <div style={{flex: 1}}/>
                <button
                    type="submit"
                    className={styles.btnPrimary}
                    disabled={isSubmitting}
                ><Icon name="save"/> {initialData ? 'Сохранить' : 'Добавить книгу'}</button>
            </div>
        </form>
    );
}
