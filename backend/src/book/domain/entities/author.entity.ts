import {Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn,} from "typeorm";

import {AuthorStatus} from "@/book/domain/enum/author-status.enum";
import {AuthorBornDateInFutureException} from "@/book/domain/exceptions/author-born-date-in-future.exception";
import {InvalidAuthorBornDateException} from "@/book/domain/exceptions/invalid-author-born-date.exception";
import {Uuid} from "@/common/domain/value-objects/uuid.vo";

/** Represents an author and protects the author's domain invariants. */
@Entity("authors")
export class Author {
  /**
   * Первичный ключ хранится примитивной строкой, а не `Uuid`.
   *
   * Автор — вторая сторона join-таблицы `book_authors`, а трансформеры колонок
   * TypeORM на этом пути не применяет: объект в value set он принимает за
   * связанную сущность и достаёт из него `idValue`, которого у `Uuid` нет.
   * Итог — `undefined` и `INSERT ... VALUES (DEFAULT, DEFAULT)`. Наружу ключ
   * по-прежнему отдаётся как `Uuid` через геттер `id`.
   */
  @PrimaryColumn({
    length: 36,
    name: "id",
    type: "varchar",
  })
  private idValue: string;

  @Column({ name: "first_name" })
  private firstNameValue: string;

  @Column({ name: "last_name" })
  private lastNameValue: string;

  @Column({ name: "slug" })
  private slugValue: string;

  @Column({
    default: AuthorStatus.DRAFT,
    enum: AuthorStatus,
    name: "status",
    type: "enum",
  })
  private statusValue: AuthorStatus;

  @Column({ name: "born_date" })
  private bornDateValue: Date;

  @Column({
    name: "avatar",
    nullable: true,
    transformer: {
      from: (value: string | null): string | undefined => value ?? undefined,
      to: (value: string | undefined): string | null => value ?? null,
    },
  })
  private avatarValue?: string;

  @CreateDateColumn({ name: "created_at" })
  private createdAtValue?: Date;

  @UpdateDateColumn({ name: "updated_at" })
  private updatedAtValue?: Date;

  /**
   * Creates an author in a valid initial state.
   *
   * @param id the author identifier
   * @param firstName
   * @param lastName
   * @param slug
   * @param avatar
   * @param bornDate
   * @returns the created author
   * @throws {Error} if a property violates an author invariant
   */
  static create(
      id: Uuid = Uuid.generate(),
      firstName:string,
      lastName:string,
      slug:string,
      bornDate:Date
  ): Author {
    const author = new Author()
    author.idValue = id.toString();
    author.firstNameValue = firstName;
    author.lastNameValue = lastName;
    author.slugValue = slug;
    author.bornDateValue  = bornDate;
    author.statusValue = AuthorStatus.DRAFT;

    return author;
  }


  /** Returns the author's display name. */
  fullName(): string {
    return `${this.firstNameValue} ${this.lastNameValue}`;
  }

  /**
   * Changes either or both parts of the author's name.
   *
   * @param firstName the new first name, if it should be changed
   * @param lastName the new last name, if it should be changed
   * @returns nothing
   */
  rename(firstName?: string, lastName?: string): void {
    if (firstName !== undefined) {
      this.firstNameValue = firstName;
    }

    if (lastName !== undefined) {
      this.lastNameValue = lastName;
    }
  }

  /** Changes the author's URL slug. */
  changeSlug(slug: string): void {
    this.slugValue = slug;
  }

  /**
   * Changes the author's date of birth.
   *
   * @param bornDate the new date of birth
   * @returns nothing
   * @throws {InvalidAuthorBornDateException} if the date is invalid
   * @throws {AuthorBornDateInFutureException} if the date is in the future
   */
  changeBornDate(bornDate: Date): void {
    Author.assertValidBornDate(bornDate);
    this.bornDateValue = new Date(bornDate);
  }

  /** Changes the author's avatar reference. */
  changeAvatar(avatar: string): void {
    this.avatarValue = avatar;
  }

  /** Removes the author's avatar reference. */
  removeAvatar(): void {
    this.avatarValue = undefined;
  }

  /** Makes the author visible in the catalog. */
  publish(): void {
    this.statusValue = AuthorStatus.PUBLISHED;
  }

  /** Removes the author from the active catalog without deleting it. */
  archive(): void {
    this.statusValue = AuthorStatus.ARCHIVED;
  }

  /** Returns the author to an editable draft. */
  moveToDraft(): void {
    this.statusValue = AuthorStatus.DRAFT;
  }

  get id(): Uuid {
    return Uuid.fromString(this.idValue);
  }

  get firstName(): string {
    return this.firstNameValue;
  }

  get lastName(): string {
    return this.lastNameValue;
  }

  get slug(): string {
    return this.slugValue;
  }

  get status(): AuthorStatus {
    return this.statusValue;
  }

  get bornDate(): Date {
    return new Date(this.bornDateValue);
  }

  get avatar(): string | undefined {
    return this.avatarValue;
  }

  get createdAt(): Date | undefined {
    return this.createdAtValue === undefined
      ? undefined
      : new Date(this.createdAtValue);
  }

  get updatedAt(): Date | undefined {
    return this.updatedAtValue === undefined
      ? undefined
      : new Date(this.updatedAtValue);
  }

  private static assertValidBornDate(bornDate: Date): void {
    const timestamp = bornDate.getTime();

    if (Number.isNaN(timestamp)) {
      throw new InvalidAuthorBornDateException();
    }

    if (timestamp > Date.now()) {
      throw new AuthorBornDateInFutureException();
    }
  }
}
