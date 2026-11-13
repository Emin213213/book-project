import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

import { Author } from "@/book/domain/entities/author.entity";
import { Category } from "@/book/domain/entities/category.entity";
import { BookMustHaveAuthorException } from "@/book/domain/exceptions/book-must-have-author.exception";
import { InvalidBookDataException } from "@/book/domain/exceptions/invalid-book-data.exception";
import { Isbn } from "@/common/domain/value-objects/isbn.vo";
import { Uuid } from "@/common/domain/value-objects/uuid.vo";

/** Данные, из которых собирается новая книга. */
export interface BookProps {
  id?: Uuid;
  title: string;
  slug: string;
  isbn: Isbn;
  authors: Author[];
  category: Category;
  price: number;
  year: number;
  pages: number;
  description?: string;
  quantity: number;
}

@Entity("books")
export class Book {
  /**
   * Первичный ключ хранится примитивной строкой, а не `Uuid`.
   *
   * TypeORM не применяет трансформеры колонок при вставке в join-таблицу
   * `book_authors`: значение из value set попадает в
   * `ColumnMetadata.getEntityValue` как есть, и объект там трактуется как
   * связанная сущность, из которой пытаются достать `idValue`. У `Uuid` такого
   * поля нет — получается `undefined` и `INSERT ... VALUES (DEFAULT, DEFAULT)`.
   * Строка проходит этот путь без изменений. Наружу ключ по-прежнему отдаётся
   * как `Uuid` через геттер `id`.
   */
  @PrimaryColumn({
    length: 36,
    name: "id",
    type: "varchar",
  })
  private idValue: string;

  @Column({
    length: 17,
    name: "isbn",
    transformer: {
      from: (value: string | Isbn): Isbn =>
        value instanceof Isbn ? value : Isbn.fromString(value),
      to: (value: Isbn): string => value.toString(),
    },
    type: "varchar",
  })
  private isbnValue: Isbn;

  @Column({ name: "slug" })
  private slugValue: string;

  @Column({ name: "title" })
  private titleValue: string;

  @Column({ name: "description", nullable: true, type: "longtext" })
  private descriptionValue?: string;

  @ManyToOne(() => Category, { nullable: false })
  @JoinColumn({ name: "category_id" })
  private categoryValue: Category;

  @ManyToMany(() => Author)
  @JoinTable({
    name: "book_authors",
    joinColumn: { name: "book_id", referencedColumnName: "idValue" },
    inverseJoinColumn: { name: "author_id", referencedColumnName: "idValue" },
  })
  private authorsValue: Author[];

  @Column({ name: "price", precision: 12, scale: 6, type: "decimal" })
  private priceValue: number;

  @Column({ name: "pages" })
  private pagesValue: number;

  @Column({ name: "year", type: "int" })
  private yearValue: number;

  @Column({ default: 0, name: "quantity" })
  private quantityValue: number;

  @Column({ default: 0, name: "real_quantity" })
  private realQuantityValue: number;

  @Column({ name: "cover", nullable: true })
  private coverValue?: string;

  @CreateDateColumn({ name: "created_at" })
  private createdAtValue?: Date;

  @UpdateDateColumn({ name: "updated_at" })
  private updatedAtValue?: Date;


  static create(props: BookProps): Book {
    const book = new Book();
    book.idValue = (props.id ?? Uuid.generate()).toString();
    book.changeTitle(props.title);
    book.changeSlug(props.slug);
    book.changeIsbn(props.isbn);
    book.changeAuthors(props.authors);
    book.changeCategory(props.category);
    book.changePrice(props.price);
    book.changePublicationYear(props.year);
    book.changePages(props.pages);
    book.changeDescription(props.description);
    book.changeQuantity(props.quantity);
    book.realQuantityValue = props.quantity;
    return book;
  }

  changeTitle(title: string): void {
    Book.assertNotBlank(title, "title");
    this.titleValue = title.trim();
  }

  changeSlug(slug: string): void {
    Book.assertNotBlank(slug, "slug");
    this.slugValue = slug.trim();
  }

  changeIsbn(isbn: Isbn): void {
    this.isbnValue = isbn;
  }

  changeAuthors(authors: Author[]): void {
    if (!authors || authors.length === 0) {
      throw new BookMustHaveAuthorException();
    }
    this.authorsValue = [...authors];
  }

  changeCategory(category: Category): void {
    if (!category) {
      throw new InvalidBookDataException("category", "is required");
    }
    this.categoryValue = category;
  }

  changePrice(price: number): void {
    if (!Number.isFinite(price) || price <= 0) {
      throw new InvalidBookDataException("price", "must be positive");
    }
    this.priceValue = price;
  }

  changePublicationYear(year: number): void {
    if (!Number.isInteger(year) || year < 1) {
      throw new InvalidBookDataException(
        "publication year",
        "must be a positive integer",
      );
    }
    this.yearValue = year;
  }

  changePages(pages: number): void {
    if (!Number.isInteger(pages) || pages <= 0) {
      throw new InvalidBookDataException("pages", "must be a positive integer");
    }
    this.pagesValue = pages;
  }

  changeDescription(description?: string): void {
    this.descriptionValue = description?.trim() || undefined;
  }

  changeQuantity(quantity: number): void {
    if (!Number.isInteger(quantity) || quantity < 0) {
      throw new InvalidBookDataException(
        "quantity",
        "must be a non-negative integer",
      );
    }
    this.quantityValue = quantity;
  }

  changeCover(cover: string): void {
    Book.assertNotBlank(cover, "cover");
    this.coverValue = cover;
  }

  removeCover(): void {
    this.coverValue = undefined;
  }

  get id(): Uuid { return Uuid.fromString(this.idValue); }
  get isbn(): Isbn { return this.isbnValue; }
  get slug(): string { return this.slugValue; }
  get title(): string { return this.titleValue; }
  get description(): string | undefined { return this.descriptionValue; }
  get authors(): Author[] { return [...(this.authorsValue ?? [])]; }
  get category(): Category { return this.categoryValue; }
  get price(): number { return Number(this.priceValue); }
  get pages(): number { return this.pagesValue; }
  get year(): number { return this.yearValue; }
  get quantity(): number { return this.quantityValue; }
  get realQuantity(): number { return this.realQuantityValue; }
  get cover(): string | undefined { return this.coverValue; }
  get createdAt(): Date | undefined { return this.copyDate(this.createdAtValue); }
  get updatedAt(): Date | undefined { return this.copyDate(this.updatedAtValue); }

  private copyDate(value?: Date): Date | undefined {
    return value === undefined ? undefined : new Date(value);
  }

  private static assertNotBlank(value: string, field: string): void {
    if (!value?.trim()) {
      throw new InvalidBookDataException(field, "cannot be empty");
    }
  }
}
