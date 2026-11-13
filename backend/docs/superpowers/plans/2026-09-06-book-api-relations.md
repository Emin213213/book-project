# Book API: связи и OpenAPI — план реализации

> **Для агентов:** используйте `superpowers:subagent-driven-development` или
> `superpowers:executing-plans`, чтобы выполнять план задача за задачей. Шаги
> помечены чекбоксами `- [ ]`.

**Цель:** заменить строковые `books.author` и `books.category` на связи
ManyToMany с авторами и ManyToOne с категорией, привести Book API к стилю
Author/Category и закрыть OpenAPI-документацию модуля.

**Архитектура:** модель, адресуемая путём, резолвится в контроллере и приезжает
в экшен объектом; связи из тела запроса резолвятся внутри экшена. `Book`
остаётся богатой доменной моделью: приватные поля, мутации только через
доменные методы, инварианты внутри сущности. Набор миграций пересобирается с
нуля, по одной таблице на файл.

**Стек:** NestJS 11, TypeORM 0.3 (MySQL 8), class-validator + class-transformer,
`@nestjs/swagger` 11, Jest (существующие тесты удаляются, новые не пишутся).

**Спека:** `docs/superpowers/specs/2026-09-06-book-api-relations-design.md`

## Глобальные ограничения

- **Тесты не пишем.** Ни один шаг плана не создаёт `.spec.ts`. Три устаревших
  spec-файла удаляются в задачах, которые ломают описанное ими поведение.
- **Уникальных индексов не добавляем.** `books.isbn`, `books.slug`,
  `authors.slug`, `categories.slug` проверяются только кодом. Исключение —
  существующий `UQ_users_email`, он остаётся.
- **Приватных хелперов в контроллерах нет.** Резолв книги по slug пишется
  прямо в теле каждого метода. Дублирование допускается сознательно.
- **Имена колонок берутся из сущностей буква в букву.** В `users` —
  `firstName`, `lastName`, `createdAt`, `updatedAt` в camelCase; в `session` —
  `accessTokenValidUntil`. Naming strategy в проекте нет.
- **Статус-лайфсайкл у `Book` не добавляется.**
- **Ветка:** вся работа идёт в `feature/book-api-relations`, отведённой от
  `main`. Текущая `feature/login-by-email-v1` не трогается.
- **Формат ошибок API:** `{ statusCode, errorCode, message }` для доменных 400
  и для 404; `{ message: 'Validation failed', errors: Record<string,string[]> }`
  для 422. Фильтры зарегистрированы в `common.module.ts` через `APP_FILTER`.

---

## Карта файлов

**Удаляются**

- `migrations/*` — все 11 файлов
- `src/book/domain/entities/book.entity.spec.ts`
- `src/book/application/dto/book/create-book.dto.spec.ts`
- `src/book/infrastructure/http/admin/resources/book.resource.spec.ts`

**Создаются**

| Файл | Ответственность |
|---|---|
| `migrations/1788652800000-create-users-table.ts` | Таблица `users` |
| `migrations/1788652810000-create-sessions-table.ts` | Таблица `session` + FK |
| `migrations/1788652820000-create-categories-table.ts` | Таблица `categories` |
| `migrations/1788652830000-create-authors-table.ts` | Таблица `authors` |
| `migrations/1788652840000-create-books-table.ts` | Таблица `books` + FK |
| `migrations/1788652850000-create-book-authors-table.ts` | `book_authors` + 2 FK |
| `src/book/domain/exceptions/invalid-book-data.exception.ts` | Нарушение инварианта поля книги |
| `src/book/domain/exceptions/book-slug-already-exists.exception.ts` | Занятый slug книги |
| `src/book/domain/exceptions/book-must-have-author.exception.ts` | Книга без авторов |
| `src/book/domain/exceptions/author-not-exist.exception.ts` | Несуществующий автор в теле запроса |
| `src/book/domain/exceptions/category-has-books.exception.ts` | Удаление категории с книгами |
| `src/book/infrastructure/http/admin/book.api-docs.ts` | Markdown-описания эндпоинтов книг |
| `src/common/infrastructure/http/resources/validation-error.resource.ts` | Схема 422 |
| `src/common/infrastructure/http/resources/domain-error.resource.ts` | Схема 400/404 |

**Изменяются**

| Файл | Что меняется |
|---|---|
| `src/book/domain/entities/book.entity.ts` | Связи, `slug`, `year: int`, `BookProps`, доменные исключения |
| `src/book/domain/exceptions/error-code.enum.ts` | Пять новых кодов |
| `src/book/domain/repositories/book.repository.interface.ts` | `findBySlug`, `existsByCategory`, `applyCategoryFilter` |
| `src/book/domain/repositories/author.repository.interface.ts` | `findById`, `findManyByIds` |
| `src/book/domain/repositories/category.repository.interface.ts` | `findById`, `createBaseQuery` |
| `src/book/infrastructure/book.repository.ts` | Джойны, новые методы, фильтр по автору через EXISTS |
| `src/book/infrastructure/repository/authors.repository.ts` | `findById`, `findManyByIds` |
| `src/book/infrastructure/repository/category.repository.ts` | `findById` |
| `src/book/application/service/book-cover.storage.ts` | `deleteFile` |
| `src/book/application/dto/book/*.ts` | `slug`, `authorIds`, `categoryId`, наследование |
| `src/book/application/actions/book/*.ts` | Резолв связей, транзакции, работа с файлами |
| `src/book/application/actions/category/*.ts` | Переход на порт, guard при удалении |
| `src/book/infrastructure/http/admin/resources/book.resource.ts` | `@ApiProperty`, вложенные ресурсы |
| `src/book/infrastructure/http/admin/book.controller.ts` | Маршруты, резолв, Swagger |
| `src/book/book.module.ts` | Регистрация `BOOK_CATEGORY_REPOSITORY` |

---

## Task 1: Пересборка миграций

**Файлы:**
- Удалить: `migrations/` — все 11 файлов
- Создать: шесть файлов из карты выше

**Интерфейсы:**
- Produces: схема БД, на которую опираются все последующие задачи — таблицы
  `books` (с `slug`, `category_id`, `cover`, `year int`), `book_authors`,
  `authors` (с `status`), `categories`, `users`, `session`.

- [ ] **Шаг 1: Убедиться, что дерево чистое**

Работа идёт в текущей ветке `feature/login-by-email-v1`, поверх baseline-коммита
`3cfa3a32`. Новая ветка не заводится: `main` не содержит `src/book` вообще —
ветки разошлись, и ответвление от `main` дало бы дерево без книжного модуля.

```bash
git status --porcelain | wc -l
```

Ожидается: `0`. Если не ноль — остановиться и разобраться, откуда изменения.

- [ ] **Шаг 2: Убедиться, что текущая цепочка действительно сломана**

Это фиксирует причину пересборки, а не просто «захотелось».

```bash
grep -n 'status' 'migrations/1785658717730-$npm_config_name.ts'
```

Ожидается: пусто. Таблица `authors` создаётся без колонки `status`, а
`migrations/1786117398924-$npm_config_name.ts` делает по ней `ALTER TABLE
authors MODIFY status ...` — на чистой базе это ошибка MySQL 1054.

- [ ] **Шаг 3: Удалить все старые миграции**

```bash
git rm migrations/*.ts
```

Удаляется в том числе data-миграция
`1786890000000-normalize-author-avatar-paths.ts`, которая чинила обратные слэши
в `authors.avatar`. На пустой базе она вырождается в no-op — потери нет.

- [ ] **Шаг 4: Создать `migrations/1788652800000-create-users-table.ts`**

```ts
import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Создаёт таблицу `users`.
 *
 * Базовая таблица схемы: на неё ссылается `session`, поэтому она идёт первой.
 * Имена `firstName`, `lastName`, `createdAt` и `updatedAt` намеренно оставлены
 * в camelCase — так они объявлены в `User`, а naming strategy в проекте нет.
 *
 * `UQ_users_email` — единственный уникальный индекс во всей схеме: на нём
 * держится вход по почте.
 */
export class CreateUsersTable1788652800000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`users\` (
                \`id\`                                  varchar(36)  NOT NULL,
                \`firstName\`                           varchar(255) NULL,
                \`lastName\`                            varchar(255) NULL,
                \`email\`                               varchar(255) NOT NULL,
                \`password\`                            varchar(255) NULL,
                \`password_reset_token\`                varchar(255) NULL,
                \`email_verification_token\`            varchar(255) NULL,
                \`email_verification_token_expires_at\` timestamp    NULL,
                \`email_verified_at\`                   timestamp    NULL,
                \`createdAt\`                           datetime(6)  NOT NULL
                                                        DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\`                           datetime(6)  NOT NULL
                                                        DEFAULT CURRENT_TIMESTAMP(6)
                                                        ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`UQ_users_email\` (\`email\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`users\``);
    }
}
```

- [ ] **Шаг 5: Создать `migrations/1788652810000-create-sessions-table.ts`**

```ts
import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Создаёт таблицу `session` и её внешний ключ на `users`.
 *
 * Имя таблицы в единственном числе — так объявлено в `@Entity({ name: 'session' })`.
 * Удаление пользователя уносит его сессии, поэтому ON DELETE CASCADE.
 */
export class CreateSessionsTable1788652810000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`session\` (
                \`id\`                    varchar(36)  NOT NULL,
                \`user_id\`               varchar(36)  NOT NULL,
                \`access_token\`          varchar(255) NOT NULL,
                \`accessTokenValidUntil\` timestamp    NOT NULL,
                \`createdAt\`             timestamp(6) NOT NULL
                                          DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\`             timestamp(6) NOT NULL
                                          DEFAULT CURRENT_TIMESTAMP(6)
                                          ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`),
                CONSTRAINT \`FK_session_user\` FOREIGN KEY (\`user_id\`)
                    REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
            ) ENGINE=InnoDB
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`session\``);
    }
}
```

- [ ] **Шаг 6: Создать `migrations/1788652820000-create-categories-table.ts`**

```ts
import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Создаёт таблицу `categories`.
 *
 * Справочник верхнего уровня без внешних ключей. Идёт раньше `books`, которая
 * на неё ссылается. Уникального индекса на `slug` нет намеренно — уникальность
 * проверяется в коде.
 */
export class CreateCategoriesTable1788652820000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`categories\` (
                \`id\`         varchar(36)  NOT NULL,
                \`title\`      varchar(255) NOT NULL,
                \`slug\`       varchar(255) NOT NULL,
                \`created_at\` datetime(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
                                            ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`categories\``);
    }
}
```

- [ ] **Шаг 7: Создать `migrations/1788652830000-create-authors-table.ts`**

```ts
import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Создаёт таблицу `authors`.
 *
 * Колонка `status` объявлена сразу вместе с таблицей. Именно её отсутствие
 * ломало прежнюю цепочку: отдельная миграция пыталась сделать по ней
 * ALTER TABLE ... MODIFY на таблице, где колонки не было.
 */
export class CreateAuthorsTable1788652830000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`authors\` (
                \`id\`         varchar(36)  NOT NULL,
                \`first_name\` varchar(255) NOT NULL,
                \`last_name\`  varchar(255) NOT NULL,
                \`slug\`       varchar(255) NOT NULL,
                \`status\`     enum('DRAFT','PUBLISHED','ARCHIVED')
                                            NOT NULL DEFAULT 'DRAFT',
                \`born_date\`  datetime     NOT NULL,
                \`avatar\`     varchar(255) NULL,
                \`created_at\` datetime(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
                                            ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE=InnoDB
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`authors\``);
    }
}
```

- [ ] **Шаг 8: Создать `migrations/1788652840000-create-books-table.ts`**

```ts
import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Создаёт таблицу `books` и её внешний ключ на `categories`.
 *
 * Строковых `author` и `category` больше нет: категория пришла внешним ключом,
 * авторы вынесены в `book_authors`. `year` хранится как `int` — год издания
 * это год, а не дата.
 *
 * ON DELETE RESTRICT: удаление категории, за которой числятся книги, должно
 * падать, а не тащить каскад по каталогу.
 */
export class CreateBooksTable1788652840000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`books\` (
                \`id\`            varchar(36)   NOT NULL,
                \`isbn\`          varchar(17)   NOT NULL,
                \`slug\`          varchar(255)  NOT NULL,
                \`title\`         varchar(255)  NOT NULL,
                \`description\`   longtext      NULL,
                \`category_id\`   varchar(36)   NOT NULL,
                \`price\`         decimal(12,6) NOT NULL,
                \`pages\`         int           NOT NULL,
                \`year\`          int           NOT NULL,
                \`quantity\`      int           NOT NULL DEFAULT 0,
                \`real_quantity\` int           NOT NULL DEFAULT 0,
                \`cover\`         varchar(255)  NULL,
                \`created_at\`    datetime(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\`    datetime(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
                                                ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`),
                CONSTRAINT \`FK_books_category\` FOREIGN KEY (\`category_id\`)
                    REFERENCES \`categories\`(\`id\`)
                    ON DELETE RESTRICT ON UPDATE CASCADE
            ) ENGINE=InnoDB
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`books\``);
    }
}
```

- [ ] **Шаг 9: Создать `migrations/1788652850000-create-book-authors-table.ts`**

```ts
import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Создаёт join-таблицу `book_authors` для связи книги с авторами.
 *
 * Составной первичный ключ структурный: без него одного автора можно привязать
 * к книге дважды.
 *
 * Удаление книги уносит её связи (CASCADE), удаление автора, за которым
 * числятся книги, должно падать (RESTRICT).
 */
export class CreateBookAuthorsTable1788652850000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`book_authors\` (
                \`book_id\`   varchar(36) NOT NULL,
                \`author_id\` varchar(36) NOT NULL,
                PRIMARY KEY (\`book_id\`, \`author_id\`),
                CONSTRAINT \`FK_book_authors_book\` FOREIGN KEY (\`book_id\`)
                    REFERENCES \`books\`(\`id\`)
                    ON DELETE CASCADE ON UPDATE CASCADE,
                CONSTRAINT \`FK_book_authors_author\` FOREIGN KEY (\`author_id\`)
                    REFERENCES \`authors\`(\`id\`)
                    ON DELETE RESTRICT ON UPDATE CASCADE
            ) ENGINE=InnoDB
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`book_authors\``);
    }
}
```

- [ ] **Шаг 10: Убрать скомпилированные старые миграции**

`data-source.ts` подхватывает и `.ts`, и `.js` по маске `migrations/*{.ts,.js}`.
Если в `dist` остались сборки удалённых файлов, они попадут в прогон.

```bash
rm -rf dist
```

- [ ] **Шаг 11: Поднять базу и пересоздать схему**

Таблица `migrations` в текущей dev-базе хранит записи об удалённых файлах, а
сами таблицы уже существуют — `CREATE TABLE` столкнётся с ними.

```bash
docker compose up -d mysql
docker exec -i book-shop-mysql mysql -uroot -proot \
  -e "DROP DATABASE IF EXISTS book_shop; CREATE DATABASE book_shop;"
```

- [ ] **Шаг 12: Прогнать миграции**

```bash
npm run migration:run
```

Ожидается: шесть строк вида `Migration CreateUsersTable1788652800000 has been
executed successfully.` без единой ошибки.

- [ ] **Шаг 13: Сверить схему с сущностями**

```bash
docker exec -i book-shop-mysql mysql -uroot -proot book_shop \
  -e "SHOW CREATE TABLE books\G SHOW CREATE TABLE book_authors\G SHOW CREATE TABLE authors\G"
```

Проверить глазами:
- в `books` нет колонок `author` и `category`, есть `slug`, `category_id`,
  `cover`, `year` типа `int`;
- у `books` один внешний ключ `FK_books_category` с `ON DELETE RESTRICT`;
- у `book_authors` составной первичный ключ и два внешних ключа, у книги
  `CASCADE`, у автора `RESTRICT`;
- в `authors` колонка `status` объявлена как
  `enum('DRAFT','PUBLISHED','ARCHIVED')` с дефолтом `DRAFT`.

- [ ] **Шаг 14: Проверить обратимость**

```bash
for i in 1 2 3 4 5 6; do npm run migration:revert; done
docker exec -i book-shop-mysql mysql -uroot -proot book_shop -e "SHOW TABLES;"
```

Ожидается: в выводе осталась только служебная таблица `migrations`.

- [ ] **Шаг 15: Прогнать заново на чистой базе**

```bash
npm run migration:run
```

Ожидается: снова шесть успешных миграций. Это и есть доказательство, что
проект теперь поднимается с нуля.

- [ ] **Шаг 16: Коммит**

```bash
git add migrations
git commit -m "refactor(db): rebuild migrations as one table per file"
```

---

## Task 2: Доменные исключения и богатая модель `Book`

**Файлы:**
- Создать: `src/book/domain/exceptions/invalid-book-data.exception.ts`
- Создать: `src/book/domain/exceptions/book-slug-already-exists.exception.ts`
- Создать: `src/book/domain/exceptions/book-must-have-author.exception.ts`
- Создать: `src/book/domain/exceptions/author-not-exist.exception.ts`
- Создать: `src/book/domain/exceptions/category-has-books.exception.ts`
- Изменить: `src/book/domain/exceptions/error-code.enum.ts`
- Изменить: `src/book/domain/entities/book.entity.ts`
- Удалить: `src/book/domain/entities/book.entity.spec.ts`

**Интерфейсы:**
- Consumes: таблицы `books` и `book_authors` из Task 1.
- Produces: `BookProps`, `Book.create(props: BookProps): Book`, геттеры
  `authors: Author[]`, `category: Category`, `slug: string`, `year: number`;
  методы `changeAuthors(authors: Author[])`, `changeCategory(category: Category)`,
  `changeSlug(slug: string)`; исключения `InvalidBookDataException(field, rule)`,
  `BookSlugAlreadyExistsException()`, `BookMustHaveAuthorException()`,
  `AuthorNotExistException(ids: string[])`, `CategoryHasBooksException()`.

- [ ] **Шаг 1: Дописать коды ошибок**

`src/book/domain/exceptions/error-code.enum.ts` — добавить в конец enum:

```ts
  // Book relations
  BOOK_SLUG_ALREADY_EXISTS = "BOOK_SLUG_ALREADY_EXISTS",
  BOOK_MUST_HAVE_AUTHOR = "BOOK_MUST_HAVE_AUTHOR",
  BOOK_INVALID_DATA = "BOOK_INVALID_DATA",
  AUTHOR_NOT_EXIST = "AUTHOR_NOT_EXIST",
  CATEGORY_HAS_BOOKS = "CATEGORY_HAS_BOOKS",
```

- [ ] **Шаг 2: Создать `invalid-book-data.exception.ts`**

Одно исключение на все нарушения инвариантов полей — пять отдельных классов на
«title пустой» и «price не положительный» того не стоят.

```ts
import { StrHelper } from "@/common/application/services/str.helper";
import { DomainException } from "@/common/domain/domain.exception";

import { ErrorCode } from "./error-code.enum";

/** Сообщает о нарушении инварианта одного поля книги. */
export class InvalidBookDataException extends DomainException {
  constructor(field: string, rule: string) {
    super(StrHelper.sprintf("Book %s %s", field, rule));
  }

  getErrorCode(): string {
    return ErrorCode.BOOK_INVALID_DATA;
  }
}
```

- [ ] **Шаг 3: Создать остальные четыре исключения**

`src/book/domain/exceptions/book-slug-already-exists.exception.ts`:

```ts
import { DomainException } from "@/common/domain/domain.exception";

import { ErrorCode } from "./error-code.enum";

export class BookSlugAlreadyExistsException extends DomainException {
  constructor() {
    super("Book with this slug already exists");
  }

  getErrorCode(): string {
    return ErrorCode.BOOK_SLUG_ALREADY_EXISTS;
  }
}
```

`src/book/domain/exceptions/book-must-have-author.exception.ts`:

```ts
import { DomainException } from "@/common/domain/domain.exception";

import { ErrorCode } from "./error-code.enum";

export class BookMustHaveAuthorException extends DomainException {
  constructor() {
    super("Book must have at least one author");
  }

  getErrorCode(): string {
    return ErrorCode.BOOK_MUST_HAVE_AUTHOR;
  }
}
```

`src/book/domain/exceptions/author-not-exist.exception.ts` — принимает список
ненайденных идентификаторов, чтобы клиент понял, какой именно автор не найден:

```ts
import { DomainException } from "@/common/domain/domain.exception";

import { ErrorCode } from "./error-code.enum";

export class AuthorNotExistException extends DomainException {
  constructor(ids: string[]) {
    super(`Authors not found: ${ids.join(", ")}`);
  }

  getErrorCode(): string {
    return ErrorCode.AUTHOR_NOT_EXIST;
  }
}
```

`src/book/domain/exceptions/category-has-books.exception.ts`:

```ts
import { DomainException } from "@/common/domain/domain.exception";

import { ErrorCode } from "./error-code.enum";

export class CategoryHasBooksException extends DomainException {
  constructor() {
    super("Category cannot be deleted while it has books");
  }

  getErrorCode(): string {
    return ErrorCode.CATEGORY_HAS_BOOKS;
  }
}
```

- [ ] **Шаг 4: Переписать `book.entity.ts`**

Полное содержимое файла:

```ts
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

/** Представляет книгу и защищает её инварианты. */
@Entity("books")
export class Book {
  @PrimaryColumn({
    length: 36,
    name: "id",
    transformer: {
      from: (value: string | Uuid): Uuid =>
        value instanceof Uuid ? value : Uuid.fromString(value),
      to: (value: Uuid): string => value.toString(),
    },
    type: "varchar",
  })
  private idValue: Uuid;

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

  /**
   * Создаёт книгу в валидном начальном состоянии.
   *
   * Каждое поле проходит через соответствующий доменный метод, поэтому
   * созданная книга не может оказаться в невалидном состоянии.
   */
  static create(props: BookProps): Book {
    const book = new Book();
    book.idValue = props.id ?? Uuid.generate();
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

  /** Заменяет список авторов книги. Книга без авторов запрещена. */
  changeAuthors(authors: Author[]): void {
    if (!authors || authors.length === 0) {
      throw new BookMustHaveAuthorException();
    }
    this.authorsValue = authors;
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

  get id(): Uuid { return this.idValue; }
  get isbn(): Isbn { return this.isbnValue; }
  get slug(): string { return this.slugValue; }
  get title(): string { return this.titleValue; }
  get description(): string | undefined { return this.descriptionValue; }
  get authors(): Author[] { return this.authorsValue ?? []; }
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
```

- [ ] **Шаг 5: Удалить устаревший spec**

Оба его теста разбирают `yearValue` как дату — эта ветка ушла вместе с
переводом колонки в `int`.

```bash
git rm src/book/domain/entities/book.entity.spec.ts
```

- [ ] **Шаг 6: Проверить компиляцию**

```bash
npx tsc --noEmit -p tsconfig.json
```

Ожидается: ошибки только в файлах, которые ещё не переписаны, — репозитории,
экшены, ресурсы и контроллер книг обращаются к исчезнувшим `book.author` и
`book.category`. Это нормально и чинится в задачах 3–8. Ошибок внутри
`book.entity.ts` и файлов исключений быть не должно.

- [ ] **Шаг 7: Коммит**

```bash
git add src/book/domain
git commit -m "feat(book): make Book a rich model with author and category relations"
```

---

## Task 3: Порты, репозитории и регистрация в модуле

**Файлы:**
- Изменить: `src/book/domain/repositories/book.repository.interface.ts`
- Изменить: `src/book/domain/repositories/author.repository.interface.ts`
- Изменить: `src/book/domain/repositories/category.repository.interface.ts`
- Изменить: `src/book/infrastructure/book.repository.ts`
- Изменить: `src/book/infrastructure/repository/authors.repository.ts`
- Изменить: `src/book/infrastructure/repository/category.repository.ts`
- Изменить: `src/book/book.module.ts`

**Интерфейсы:**
- Consumes: `Book` из Task 2.
- Produces: `IBookRepository.findBySlug(slug: string): Promise<Book | null>`,
  `existsByCategory(categoryId: Uuid): Promise<boolean>`,
  `applyCategoryFilter(qb, categorySlug: string): void`;
  `IAuthorRepository.findManyByIds(ids: Uuid[]): Promise<Author[]>`,
  `findById(id: Uuid): Promise<Author | null>`;
  `ICategoryRepository.findById(id: Uuid): Promise<Category | null>`,
  `createBaseQuery(): SelectQueryBuilder<Category>`;
  токен `BOOK_CATEGORY_REPOSITORY` пригоден к внедрению.

- [ ] **Шаг 1: Обновить `book.repository.interface.ts`**

```ts
import type { SelectQueryBuilder } from 'typeorm';
import { Book } from '../entities/book.entity';
import { Isbn } from '@/common/domain/value-objects/isbn.vo';
import { Uuid } from '@/common/domain/value-objects/uuid.vo';

export const BOOK_REPOSITORY = Symbol('BOOK_REPOSITORY');

export interface IBookRepository {
  findById(id: Uuid): Promise<Book | null>;
  findBySlug(slug: string): Promise<Book | null>;
  findByIsbn(isbn: Isbn): Promise<Book | null>;
  existsByCategory(categoryId: Uuid): Promise<boolean>;
  createBaseQuery(): SelectQueryBuilder<Book>;
  applyTitleFilter(qb: SelectQueryBuilder<Book>, title: string): void;
  applyAuthorFilter(qb: SelectQueryBuilder<Book>, authorSlug: string): void;
  applyCategoryFilter(qb: SelectQueryBuilder<Book>, categorySlug: string): void;
}
```

- [ ] **Шаг 2: Переписать `book.repository.ts`**

```ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Book } from '../domain/entities/book.entity';
import type { IBookRepository } from '../domain/repositories/book.repository.interface';
import { Isbn } from '@/common/domain/value-objects/isbn.vo';
import { Uuid } from '@/common/domain/value-objects/uuid.vo';

@Injectable()
export class BookRepository implements IBookRepository {
  constructor(
    @InjectRepository(Book)
    private readonly repository: Repository<Book>,
  ) {}

  /**
   * Базовый запрос с подтянутыми связями.
   *
   * Без этих джойнов ресурс отдаст `undefined` вместо авторов и категории.
   */
  createBaseQuery(): SelectQueryBuilder<Book> {
    return this.repository
      .createQueryBuilder('book')
      .leftJoinAndSelect('book.authorsValue', 'author')
      .leftJoinAndSelect('book.categoryValue', 'category');
  }

  async findById(id: Uuid): Promise<Book | null> {
    return this.createBaseQuery()
      .where('book.idValue = :id', { id: id.value })
      .getOne();
  }

  async findBySlug(slug: string): Promise<Book | null> {
    return this.createBaseQuery()
      .where('book.slugValue = :slug', { slug })
      .getOne();
  }

  async findByIsbn(isbn: Isbn): Promise<Book | null> {
    return this.createBaseQuery()
      .where('book.isbnValue = :isbn', { isbn: isbn.value })
      .getOne();
  }

  /** Нужен, чтобы удаление категории с книгами падало осмысленной 400, а не ошибкой FK. */
  async existsByCategory(categoryId: Uuid): Promise<boolean> {
    const count = await this.repository
      .createQueryBuilder('book')
      .where('book.category_id = :categoryId', { categoryId: categoryId.value })
      .getCount();

    return count > 0;
  }

  applyTitleFilter(qb: SelectQueryBuilder<Book>, title: string): void {
    qb.andWhere('book.titleValue LIKE :title', { title: `%${title}%` });
  }

  /**
   * Фильтрует книги по slug автора через EXISTS, а не по join-алиасу.
   *
   * Условие на алиас `author` отрезало бы от каждой книги всех авторов, кроме
   * совпавшего, — коллекция в ответе стала бы неполной.
   */
  applyAuthorFilter(qb: SelectQueryBuilder<Book>, authorSlug: string): void {
    qb.andWhere(
      `EXISTS (
         SELECT 1 FROM book_authors ba
         INNER JOIN authors a ON a.id = ba.author_id
         WHERE ba.book_id = book.id AND a.slug = :authorSlug
       )`,
      { authorSlug },
    );
  }

  applyCategoryFilter(qb: SelectQueryBuilder<Book>, categorySlug: string): void {
    qb.andWhere('category.slug = :categorySlug', { categorySlug });
  }
}
```

- [ ] **Шаг 3: Обновить порт и репозиторий авторов**

`src/book/domain/repositories/author.repository.interface.ts`:

```ts
import type { SelectQueryBuilder } from "typeorm";

import type { Author } from "@/book/domain/entities/author.entity";
import type { Uuid } from "@/common/domain/value-objects/uuid.vo";

/** Идентифицирует репозиторий авторов в контейнере NestJS. */
export const AUTHOR_REPOSITORY = Symbol("AUTHOR_REPOSITORY");

/** Описывает операции хранения, необходимые для авторов. */
export interface IAuthorRepository {
  createBaseQuery(): SelectQueryBuilder<Author>;
  findBySlug(slug: string): Promise<Author | null>;
  findById(id: Uuid): Promise<Author | null>;
  findManyByIds(ids: Uuid[]): Promise<Author[]>;
}
```

`src/book/infrastructure/repository/authors.repository.ts` — добавить два метода
в класс:

```ts
    async findById(id: Uuid): Promise<Author | null> {
        return this.createQueryBuilder("author")
            .where("author.idValue = :id", {id: id.value})
            .getOne();
    }

    /** Возвращает только существующих авторов; вызывающий сам сверяет количество. */
    async findManyByIds(ids: Uuid[]): Promise<Author[]> {
        if (ids.length === 0) {
            return [];
        }

        return this.createQueryBuilder("author")
            .where("author.idValue IN (:...ids)", {ids: ids.map((id) => id.value)})
            .getMany();
    }
```

Добавить импорт `Uuid`:

```ts
import {Uuid} from "@/common/domain/value-objects/uuid.vo";
```

- [ ] **Шаг 4: Обновить порт и репозиторий категорий**

`src/book/domain/repositories/category.repository.interface.ts` — заменить файл
целиком (нынешние импорты `Email` и `User` не используются):

```ts
import type { SelectQueryBuilder } from "typeorm";

import type { Category } from "@/book/domain/entities/category.entity";
import type { Uuid } from "@/common/domain/value-objects/uuid.vo";

/** Идентифицирует репозиторий категорий в контейнере NestJS. */
export const BOOK_CATEGORY_REPOSITORY = Symbol('BOOK_CATEGORY_REPOSITORY');

/** Описывает операции хранения, необходимые для категорий. */
export interface ICategoryRepository {
    findBySlug(slug: string): Promise<Category | null>;
    findById(id: Uuid): Promise<Category | null>;
    createBaseQuery(): SelectQueryBuilder<Category>;
    remove(category: Category): Promise<Category>;
}
```

`src/book/infrastructure/repository/category.repository.ts` — добавить `findById`:

```ts
    public async findById(id: Uuid): Promise<Category | null> {
        return this.createQueryBuilder("category")
            .where("category.id = :id", {id: id.value})
            .getOne();
    }
```

И импорт `Uuid`:

```ts
import {Uuid} from "@/common/domain/value-objects/uuid.vo";
```

- [ ] **Шаг 5: Зарегистрировать токен категорий в модуле**

`src/book/book.module.ts` — в массив `providers` рядом с `CategoryRepository`
добавить:

```ts
        {
            provide: BOOK_CATEGORY_REPOSITORY,
            useExisting: CategoryRepository,
        },
```

`BOOK_CATEGORY_REPOSITORY` уже импортирован в этом файле — до сих пор импорт был
мёртвым, потому что токен нигде не регистрировался.

- [ ] **Шаг 6: Проверить компиляцию**

```bash
npx tsc --noEmit -p tsconfig.json
```

Ожидается: ошибок в файлах репозиториев и портов нет. Оставшиеся ошибки — в
экшенах, ресурсах и контроллере, они чинятся дальше.

- [ ] **Шаг 7: Коммит**

```bash
git add src/book/domain/repositories src/book/infrastructure src/book/book.module.ts
git commit -m "feat(book): extend repository ports for relations and register category token"
```

---

## Task 4: DTO книг

**Файлы:**
- Изменить: `src/book/application/dto/book/create-book.dto.ts`
- Изменить: `src/book/application/dto/book/update-book.dto.ts`
- Изменить: `src/book/application/dto/book/list-books.dto.ts`
- Удалить: `src/book/application/dto/book/create-book.dto.spec.ts`

**Интерфейсы:**
- Produces: `CreateBookDto` с полями `title`, `slug`, `isbn: Isbn`,
  `categoryId: string`, `authorIds: string[]`, `price`, `year`, `pages`,
  `description`, `quantity`, `cover?: Express.Multer.File` и методом
  `withCover(file?)`; `UpdateBookDto` — частичный `CreateBookDto` без `cover`;
  `ListBooksDto` с `title?`, `authorSlug?`, `categorySlug?`, `page`, `per_page`.

- [ ] **Шаг 1: Переписать `create-book.dto.ts`**

```ts
import {
    ArrayNotEmpty,
    IsDefined,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsPositive,
    IsString,
    IsUUID,
} from 'class-validator';
import {Transform, Type} from "class-transformer";
import {ApiProperty, ApiPropertyOptional} from "@nestjs/swagger";

import {Str} from "@/book/application/service/str";
import {Isbn} from "@/common/domain/value-objects/isbn.vo";

export class CreateBookDto {

    @ApiProperty({
        description: "Название книги. Обязательное, непустая строка.",
        example: "1984",
    })
    @IsNotEmpty()
    @IsString()
    public title: string

    @ApiProperty({
        description:
            "Человекочитаемый идентификатор книги в URL. Значение нормализуется " +
            "перед валидацией, поэтому можно прислать обычное название.",
        example: "1984",
    })
    @Transform(({value}) => (value === undefined ? undefined : Str.slug(value)))
    @IsString()
    @IsNotEmpty()
    public slug: string

    @ApiProperty({
        description:
            "ISBN строкой. Перед валидацией значение превращается в объект-значение `Isbn`.",
        example: "978-0-452-28423-4",
        type: String,
    })
    @Transform(({value}) => Isbn.fromString(String(value).trim()))
    @IsDefined()
    public isbn: Isbn

    @ApiProperty({
        description: "Идентификатор категории книги.",
        example: "550e8400-e29b-41d4-a716-446655440000",
        format: "uuid",
    })
    @IsUUID()
    public categoryId: string

    @ApiProperty({
        description:
            "Идентификаторы авторов книги. Нужен хотя бы один. " +
            "В multipart/form-data одиночное значение приходит строкой, поэтому " +
            "перед валидацией оно оборачивается в массив.",
        example: ["550e8400-e29b-41d4-a716-446655440001"],
        isArray: true,
        type: String,
    })
    @Transform(({value}) => (Array.isArray(value) ? value : [value]))
    @ArrayNotEmpty()
    @IsUUID(undefined, {each: true})
    public authorIds: string[]

    @ApiProperty({
        description: "Цена книги, положительное целое.",
        example: 299,
        minimum: 1,
        type: Number,
    })
    @IsInt()
    @IsPositive()
    @Type(() => Number)
    public price: number

    @ApiProperty({
        description: "Год издания, положительное целое.",
        example: 1949,
        minimum: 1,
        type: Number,
    })
    @IsInt()
    @IsPositive()
    @Type(() => Number)
    public year: number

    @ApiProperty({
        description: "Количество страниц, положительное целое.",
        example: 328,
        minimum: 1,
        type: Number,
    })
    @IsInt()
    @IsPositive()
    @Type(() => Number)
    public pages: number

    @ApiProperty({
        description: "Описание книги.",
        example: "Роман-антиутопия о слежке, цензуре и тоталитарной власти.",
    })
    @IsString()
    public description: string

    @ApiProperty({
        description: "Начальное количество экземпляров.",
        example: 20,
        minimum: 1,
        type: Number,
    })
    @IsInt()
    @IsPositive()
    @Type(() => Number)
    public quantity: number

    @ApiPropertyOptional({
        description: "Файл обложки.",
        format: "binary",
        type: "string",
    })
    @IsOptional()
    public cover?: Express.Multer.File

    public withCover(file?: Express.Multer.File): void {
        this.cover = file
    }
}
```

`@IsUUID()` идёт без версии намеренно: `Uuid.generate()` не производит UUID v4,
и `@IsUUID('4')` отбраковал бы каждый идентификатор, который выдаёт система.

- [ ] **Шаг 2: Переписать `update-book.dto.ts`**

```ts
import { PartialType } from '@nestjs/swagger';

import { CreateBookDto } from './create-book.dto';

/**
 * Частичное обновление книги.
 *
 * Наследуется от `CreateBookDto`, как `UpdateAuthorDto` и `UpdateCategoryDto`:
 * поля и их валидация не дублируются.
 *
 * Поле `cover` намеренно не исключается: оно нужно, чтобы Swagger отрисовал
 * поле загрузки файла в форме PATCH. Сам файл приходит через
 * `FileInterceptor` и передаётся в экшен отдельным аргументом — значение из
 * тела не читается.
 */
export class UpdateBookDto extends PartialType(CreateBookDto) {}
```

- [ ] **Шаг 3: Переписать `list-books.dto.ts`**

```ts
import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { PaginationQueryDto } from '@/common/application/dto/pagination-query.dto';

/** Параметры выборки списка книг. */
export class ListBooksDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Фильтр по части названия.',
    example: '1984',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Фильтр по slug автора.',
    example: 'george-orwell',
  })
  @IsOptional()
  @IsString()
  authorSlug?: string;

  @ApiPropertyOptional({
    description: 'Фильтр по slug категории.',
    example: 'dystopian-fiction',
  })
  @IsOptional()
  @IsString()
  categorySlug?: string;
}
```

`PaginationQueryDto` уже несёт `page` и `per_page` с корректным
`@Type(() => Number)`, поэтому строковые query-параметры проходят валидацию.

- [ ] **Шаг 4: Удалить устаревший spec**

Он проверяет поля `author` и `category`, которых больше нет.

```bash
git rm src/book/application/dto/book/create-book.dto.spec.ts
```

- [ ] **Шаг 5: Проверить компиляцию DTO**

```bash
npx tsc --noEmit -p tsconfig.json
```

Ожидается: в каталоге `application/dto/book` ошибок нет.

- [ ] **Шаг 6: Коммит**

```bash
git add src/book/application/dto/book
git commit -m "feat(book): accept authorIds, categoryId and slug in book DTOs"
```

---

## Task 5: Экшены книг и удаление файлов из хранилища

**Файлы:**
- Изменить: `src/book/application/service/book-cover.storage.ts`
- Изменить: `src/book/application/actions/book/create-book.action.ts`
- Изменить: `src/book/application/actions/book/update-book.action.ts`
- Изменить: `src/book/application/actions/book/delete-book.action.ts`
- Изменить: `src/book/application/actions/book/find-all-books.action.ts`

**Интерфейсы:**
- Consumes: порты из Task 3, DTO из Task 4, `Book.create` из Task 2.
- Produces: `CreateBookAction.handle(context: CreateBookDto): Promise<Book>`,
  `UpdateBookAction.handle(book: Book, context: UpdateBookDto, cover?: Express.Multer.File): Promise<Book>`,
  `DeleteBookAction.handle(book: Book): Promise<void>`,
  `FindAllBooksAction.handle(context: ListBooksDto): Promise<[Book[], number]>`,
  `BookCoverStorage.deleteFile(path: string): Promise<void>`.

- [ ] **Шаг 1: Добавить `deleteFile` в `book-cover.storage.ts`**

`CommonFileStorage.delete` уже есть, но наружу не проксирован.

```ts
    public async deleteFile(relativePath: string): Promise<void> {
        await this.commonFileStorage.delete(relativePath)
    }
```

- [ ] **Шаг 2: Переписать `create-book.action.ts`**

```ts
import {Inject, Injectable} from '@nestjs/common';
import {DataSource, EntityManager} from 'typeorm';

import {BookCoverStorage} from "@/book/application/service/book-cover.storage";
import {Book} from '../../../domain/entities/book.entity';
import {Author} from '@/book/domain/entities/author.entity';
import {Category} from '@/book/domain/entities/category.entity';
import {AuthorNotExistException} from '@/book/domain/exceptions/author-not-exist.exception';
import {BookIsbnAlreadyExistException} from '../../../domain/exceptions/book-isbn-already-exist.exception';
import {BookSlugAlreadyExistsException} from '@/book/domain/exceptions/book-slug-already-exists.exception';
import {CategoryNotExistException} from '@/book/domain/exceptions/category-not-exist.exception';
import {
    AUTHOR_REPOSITORY,
    type IAuthorRepository,
} from '@/book/domain/repositories/author.repository.interface';
import {
    BOOK_CATEGORY_REPOSITORY,
    type ICategoryRepository,
} from '@/book/domain/repositories/category.repository.interface';
import {CreateBookDto} from '../../dto/book/create-book.dto';
import {Uuid} from '@/common/domain/value-objects/uuid.vo';

/** Создаёт книгу вместе с её связями. */
@Injectable()
export class CreateBookAction {
    constructor(
        @Inject(AUTHOR_REPOSITORY)
        private readonly authorRepository: IAuthorRepository,
        @Inject(BOOK_CATEGORY_REPOSITORY)
        private readonly categoryRepository: ICategoryRepository,
        private readonly dataSource: DataSource,
        private readonly bookStorage: BookCoverStorage,
    ) {
    }

    async handle(context: CreateBookDto): Promise<Book> {
        const id = Uuid.generate();

        // Файл сохраняется до транзакции: сетевой и дисковый ввод-вывод не
        // должен держать соединение пула. При любой ошибке ниже файл удаляется.
        const coverPath = context.cover
            ? await this.bookStorage.saveUploadedFile(context.cover, id.value)
            : undefined;

        try {
            return await this.dataSource.transaction(async (em) => {
                const category = await this.resolveCategory(context.categoryId);
                const authors = await this.resolveAuthors(context.authorIds);

                await this.assertIsbnAvailable(em, context.isbn.value);
                await this.assertSlugAvailable(em, context.slug);

                const book = Book.create({
                    id,
                    title: context.title,
                    slug: context.slug,
                    isbn: context.isbn,
                    authors,
                    category,
                    price: context.price,
                    year: context.year,
                    pages: context.pages,
                    description: context.description,
                    quantity: context.quantity,
                });

                if (coverPath) {
                    book.changeCover(coverPath);
                }

                return em.save(book);
            });
        } catch (error) {
            if (coverPath) {
                await this.bookStorage.deleteFile(coverPath);
            }

            throw error;
        }
    }

    private async resolveCategory(categoryId: string): Promise<Category> {
        const category = await this.categoryRepository.findById(
            Uuid.fromString(categoryId),
        );

        if (!category) {
            throw new CategoryNotExistException();
        }

        return category;
    }

    private async resolveAuthors(authorIds: string[]): Promise<Author[]> {
        const ids = authorIds.map((id) => Uuid.fromString(id));
        const authors = await this.authorRepository.findManyByIds(ids);

        if (authors.length !== authorIds.length) {
            const found = new Set(authors.map((author) => author.id.value));
            throw new AuthorNotExistException(
                authorIds.filter((id) => !found.has(id)),
            );
        }

        return authors;
    }

    // Уникальность проверяется менеджером транзакции, а не отдельным
    // репозиторием: уникальных индексов в БД нет, и это единственная защита.
    private async assertIsbnAvailable(em: EntityManager, isbn: string): Promise<void> {
        const existing = await em
            .createQueryBuilder(Book, 'book')
            .where('book.isbnValue = :isbn', {isbn})
            .getOne();

        if (existing) {
            throw new BookIsbnAlreadyExistException();
        }
    }

    private async assertSlugAvailable(em: EntityManager, slug: string): Promise<void> {
        const existing = await em
            .createQueryBuilder(Book, 'book')
            .where('book.slugValue = :slug', {slug})
            .getOne();

        if (existing) {
            throw new BookSlugAlreadyExistsException();
        }
    }
}
```

- [ ] **Шаг 3: Переписать `update-book.action.ts`**

```ts
import {Inject, Injectable} from '@nestjs/common';
import {DataSource, EntityManager} from 'typeorm';

import {BookCoverStorage} from '@/book/application/service/book-cover.storage';
import {Book} from '../../../domain/entities/book.entity';
import {Author} from '@/book/domain/entities/author.entity';
import {AuthorNotExistException} from '@/book/domain/exceptions/author-not-exist.exception';
import {BookIsbnAlreadyExistException} from '../../../domain/exceptions/book-isbn-already-exist.exception';
import {BookSlugAlreadyExistsException} from '@/book/domain/exceptions/book-slug-already-exists.exception';
import {CategoryNotExistException} from '@/book/domain/exceptions/category-not-exist.exception';
import {
    AUTHOR_REPOSITORY,
    type IAuthorRepository,
} from '@/book/domain/repositories/author.repository.interface';
import {
    BOOK_CATEGORY_REPOSITORY,
    type ICategoryRepository,
} from '@/book/domain/repositories/category.repository.interface';
import {UpdateBookDto} from '../../dto/book/update-book.dto';
import {Uuid} from '@/common/domain/value-objects/uuid.vo';

/** Частично обновляет книгу и её связи. */
@Injectable()
export class UpdateBookAction {
    constructor(
        @Inject(AUTHOR_REPOSITORY)
        private readonly authorRepository: IAuthorRepository,
        @Inject(BOOK_CATEGORY_REPOSITORY)
        private readonly categoryRepository: ICategoryRepository,
        private readonly dataSource: DataSource,
        private readonly bookStorage: BookCoverStorage,
    ) {
    }

    async handle(
        book: Book,
        context: UpdateBookDto,
        cover?: Express.Multer.File,
    ): Promise<Book> {
        const previousCover = book.cover;

        const coverPath = cover
            ? await this.bookStorage.saveUploadedFile(cover, book.id.value)
            : undefined;

        try {
            const updated = await this.dataSource.transaction(async (em) => {
                if (context.title !== undefined) {
                    book.changeTitle(context.title);
                }

                if (context.slug !== undefined) {
                    await this.assertSlugAvailable(em, context.slug, book.id);
                    book.changeSlug(context.slug);
                }

                if (context.isbn !== undefined) {
                    await this.assertIsbnAvailable(em, context.isbn.value, book.id);
                    book.changeIsbn(context.isbn);
                }

                if (context.categoryId !== undefined) {
                    const category = await this.categoryRepository.findById(
                        Uuid.fromString(context.categoryId),
                    );

                    if (!category) {
                        throw new CategoryNotExistException();
                    }

                    book.changeCategory(category);
                }

                if (context.authorIds !== undefined) {
                    book.changeAuthors(await this.resolveAuthors(context.authorIds));
                }

                if (context.price !== undefined) {
                    book.changePrice(context.price);
                }

                if (context.year !== undefined) {
                    book.changePublicationYear(context.year);
                }

                if (context.pages !== undefined) {
                    book.changePages(context.pages);
                }

                if (context.description !== undefined) {
                    book.changeDescription(context.description);
                }

                if (context.quantity !== undefined) {
                    book.changeQuantity(context.quantity);
                }

                if (coverPath) {
                    book.changeCover(coverPath);
                }

                return em.save(book);
            });

            // Старый файл убирается только после успешного коммита.
            if (coverPath && previousCover) {
                await this.bookStorage.deleteFile(previousCover);
            }

            return updated;
        } catch (error) {
            if (coverPath) {
                await this.bookStorage.deleteFile(coverPath);
            }

            throw error;
        }
    }

    private async resolveAuthors(authorIds: string[]): Promise<Author[]> {
        const ids = authorIds.map((id) => Uuid.fromString(id));
        const authors = await this.authorRepository.findManyByIds(ids);

        if (authors.length !== authorIds.length) {
            const found = new Set(authors.map((author) => author.id.value));
            throw new AuthorNotExistException(
                authorIds.filter((id) => !found.has(id)),
            );
        }

        return authors;
    }

    // Сама книга исключается из проверки: иначе PATCH с текущим значением
    // падал бы на «уже занято».
    private async assertSlugAvailable(
        em: EntityManager,
        slug: string,
        id: Uuid,
    ): Promise<void> {
        const existing = await em
            .createQueryBuilder(Book, 'book')
            .where('book.slugValue = :slug', {slug})
            .andWhere('book.idValue != :id', {id: id.value})
            .getOne();

        if (existing) {
            throw new BookSlugAlreadyExistsException();
        }
    }

    private async assertIsbnAvailable(
        em: EntityManager,
        isbn: string,
        id: Uuid,
    ): Promise<void> {
        const existing = await em
            .createQueryBuilder(Book, 'book')
            .where('book.isbnValue = :isbn', {isbn})
            .andWhere('book.idValue != :id', {id: id.value})
            .getOne();

        if (existing) {
            throw new BookIsbnAlreadyExistException();
        }
    }
}
```

- [ ] **Шаг 4: Переписать `delete-book.action.ts`**

```ts
import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { BookCoverStorage } from '@/book/application/service/book-cover.storage';
import { Book } from '../../../domain/entities/book.entity';

/** Удаляет книгу вместе с файлом обложки. */
@Injectable()
export class DeleteBookAction {
  constructor(
    private readonly dataSource: DataSource,
    private readonly bookStorage: BookCoverStorage,
  ) {}

  async handle(book: Book): Promise<void> {
    const cover = book.cover;

    await this.dataSource.transaction(async (em) => {
      await em.remove(book);
    });

    // Файл удаляется после коммита: иначе откат оставил бы книгу без обложки.
    if (cover) {
      await this.bookStorage.deleteFile(cover);
    }
  }
}
```

Связи в `book_authors` уносит `ON DELETE CASCADE`, отдельной очистки не нужно.

- [ ] **Шаг 5: Переписать `find-all-books.action.ts`**

```ts
import { Inject, Injectable } from '@nestjs/common';

import { Book } from '../../../domain/entities/book.entity';
import { BOOK_REPOSITORY } from '../../../domain/repositories/book.repository.interface';
import type { IBookRepository } from '../../../domain/repositories/book.repository.interface';
import { ListBooksDto } from '../../dto/book/list-books.dto';

/** Возвращает страницу книг вместе с общим количеством. */
@Injectable()
export class FindAllBooksAction {
  constructor(
    @Inject(BOOK_REPOSITORY)
    private readonly bookRepository: IBookRepository,
  ) {}

  async handle(context: ListBooksDto): Promise<[Book[], number]> {
    const qb = this.bookRepository.createBaseQuery();

    if (context.title) {
      this.bookRepository.applyTitleFilter(qb, context.title);
    }

    if (context.authorSlug) {
      this.bookRepository.applyAuthorFilter(qb, context.authorSlug);
    }

    if (context.categorySlug) {
      this.bookRepository.applyCategoryFilter(qb, context.categorySlug);
    }

    const page = context.page ?? 1;
    const perPage = context.per_page ?? 15;

    return qb
      .skip((page - 1) * perPage)
      .take(perPage)
      .getManyAndCount();
  }
}
```

- [ ] **Шаг 6: Проверить компиляцию экшенов**

```bash
npx tsc --noEmit -p tsconfig.json
```

Ожидается: в `application/actions/book` ошибок нет. Остались ошибки в ресурсах
и контроллере.

- [ ] **Шаг 7: Коммит**

```bash
git add src/book/application/actions/book src/book/application/service/book-cover.storage.ts
git commit -m "feat(book): resolve relations inside book actions and clean up cover files"
```

---

## Task 6: Категории на порт и защита от удаления с книгами

**Файлы:**
- Изменить: `src/book/application/actions/category/create-category.action.ts`
- Изменить: `src/book/application/actions/category/list-all-categories.action.ts`
- Изменить: `src/book/application/actions/category/update-category.action.ts`
- Изменить: `src/book/application/actions/category/delete-category.action.ts`

**Интерфейсы:**
- Consumes: `BOOK_CATEGORY_REPOSITORY`, `ICategoryRepository`,
  `IBookRepository.existsByCategory` из Task 3;
  `CategoryHasBooksException` из Task 2.
- Produces: `DeleteCategoryAction.handle(slug: string): Promise<void>` —
  сигнатура не меняется, меняется поведение.

- [ ] **Шаг 1: Перевести четыре экшена на порт**

В каждом из четырёх файлов заменить внедрение конкретного класса на токен.
Было:

```ts
import {CategoryRepository} from "@/book/infrastructure/repository/category.repository";
...
        @Inject() private readonly categoryRepository: CategoryRepository,
```

Стало:

```ts
import {
    BOOK_CATEGORY_REPOSITORY,
    type ICategoryRepository,
} from "@/book/domain/repositories/category.repository.interface";
...
        @Inject(BOOK_CATEGORY_REPOSITORY)
        private readonly categoryRepository: ICategoryRepository,
```

Заодно убрать из этих файлов мёртвые импорты: `BookResource` и `BookRepository`
в `delete-category.action.ts`, `BookRepository` в
`list-all-categories.action.ts`, `dataSource` из `../../../../../data-source` и
`node:assert` в `update-category.action.ts`. Последний тянет второй `DataSource`
в рантайм приложения.

- [ ] **Шаг 2: Добавить проверку в `delete-category.action.ts`**

Полное содержимое файла:

```ts
import {Inject, Injectable} from "@nestjs/common";

import {CategoryHasBooksException} from "@/book/domain/exceptions/category-has-books.exception";
import {CategoryNotExistException} from "@/book/domain/exceptions/category-not-exist.exception";
import {
    BOOK_CATEGORY_REPOSITORY,
    type ICategoryRepository,
} from "@/book/domain/repositories/category.repository.interface";
import {
    BOOK_REPOSITORY,
    type IBookRepository,
} from "@/book/domain/repositories/book.repository.interface";

/** Удаляет категорию, за которой не числится ни одной книги. */
@Injectable()
export class DeleteCategoryAction {

    constructor(
        @Inject(BOOK_CATEGORY_REPOSITORY)
        private readonly categoryRepository: ICategoryRepository,
        @Inject(BOOK_REPOSITORY)
        private readonly bookRepository: IBookRepository,
    ) {
    }

    public async handle(slug: string): Promise<void> {
        const category = await this.categoryRepository.findBySlug(slug)

        if (!category) {
            throw new CategoryNotExistException()
        }

        // Внешний ключ стоит на RESTRICT: без этой проверки MySQL вернул бы
        // ошибку ограничения, и клиент получил бы 500 вместо осмысленной 400.
        if (await this.bookRepository.existsByCategory(category.id)) {
            throw new CategoryHasBooksException()
        }

        await this.categoryRepository.remove(category)
    }
}
```

- [ ] **Шаг 3: Проверить компиляцию**

```bash
npx tsc --noEmit -p tsconfig.json
```

Ожидается: в `application/actions/category` ошибок нет.

- [ ] **Шаг 4: Коммит**

```bash
git add src/book/application/actions/category
git commit -m "refactor(category): depend on repository port and guard delete with books"
```

---

## Task 7: Ресурсы книги и схемы ошибок

**Файлы:**
- Создать: `src/common/infrastructure/http/resources/validation-error.resource.ts`
- Создать: `src/common/infrastructure/http/resources/domain-error.resource.ts`
- Изменить: `src/book/infrastructure/http/admin/resources/book.resource.ts`
- Изменить: `src/book/infrastructure/http/admin/resources/collections/book-paginated.resource.ts`
- Удалить: `src/book/infrastructure/http/admin/resources/book.resource.spec.ts`

**Интерфейсы:**
- Consumes: `Book` из Task 2.
- Produces: `BookResource.make(book, coverStorage, avatarStorage): BookResource`,
  `BookResource.collection(books, coverStorage, avatarStorage): BookResource[]`,
  классы `ValidationErrorResource` и `DomainErrorResource`.

- [ ] **Шаг 1: Создать `domain-error.resource.ts`**

Одна схема покрывает и доменные 400, и 404: `DomainExceptionFilter` и
`HttpErrorCodeExceptionFilter` отдают одинаковое тело.

```ts
import { ApiProperty } from "@nestjs/swagger";

/** Тело ответа при доменной ошибке или отсутствии ресурса. */
export class DomainErrorResource {
  @ApiProperty({
    description: "HTTP-статус ответа.",
    example: 400,
    type: Number,
  })
  statusCode: number;

  @ApiProperty({
    description:
      "Стабильный код ошибки приложения. Ветвитесь по нему, а не по тексту сообщения.",
    example: "BOOK_ISBN_ALREADY_EXISTS",
  })
  errorCode: string;

  @ApiProperty({
    description: "Человекочитаемое описание ошибки.",
    example: "Book with this ISBN already exists",
  })
  message: string;
}
```

- [ ] **Шаг 2: Создать `validation-error.resource.ts`**

```ts
import { ApiProperty } from "@nestjs/swagger";

/** Тело ответа при непройденной валидации DTO. */
export class ValidationErrorResource {
  @ApiProperty({
    description: "Постоянный текст для ошибок валидации.",
    example: "Validation failed",
  })
  message: string;

  @ApiProperty({
    additionalProperties: { items: { type: "string" }, type: "array" },
    description: "Нарушенные правила, сгруппированные по имени поля.",
    example: { authorIds: ["each value in authorIds must be a UUID"] },
    type: "object",
  })
  errors: Record<string, string[]>;
}
```

- [ ] **Шаг 3: Переписать `book.resource.ts`**

```ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { BookCoverStorage } from '@/book/application/service/book-cover.storage';
import { AuthorAvatarStorage } from '@/book/application/service/author-avatar.storage';
import { Book } from '../../../../domain/entities/book.entity';
import { AuthorResource } from './author.resouces';
import { CategoryResource } from './category.resource';

/** Представляет книгу в ответе админского HTTP API. */
export class BookResource {
  @ApiProperty({
    description: 'Идентификатор книги.',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({ description: 'Название книги.', example: '1984' })
  title: string;

  @ApiProperty({
    description: 'Человекочитаемый идентификатор книги в URL.',
    example: '1984',
  })
  slug: string;

  @ApiProperty({
    description: 'ISBN книги.',
    example: '978-0-452-28423-4',
  })
  isbn: string;

  @ApiPropertyOptional({
    description: 'Описание книги.',
    example: 'Роман-антиутопия о слежке, цензуре и тоталитарной власти.',
  })
  description?: string;

  @ApiProperty({
    description: 'Авторы книги. Всегда содержит хотя бы одного автора.',
    isArray: true,
    type: () => AuthorResource,
  })
  authors: AuthorResource[];

  @ApiProperty({
    description: 'Категория книги.',
    type: () => CategoryResource,
  })
  category: CategoryResource;

  @ApiProperty({ description: 'Цена книги.', example: 299, type: Number })
  price: number;

  @ApiProperty({ description: 'Количество страниц.', example: 328, type: Number })
  pages: number;

  @ApiProperty({ description: 'Год издания.', example: 1949, type: Number })
  year: number;

  @ApiProperty({
    description: 'Заявленное количество экземпляров.',
    example: 20,
    type: Number,
  })
  quantity: number;

  @ApiProperty({
    description: 'Фактическое количество экземпляров на складе.',
    example: 20,
    type: Number,
  })
  realQuantity: number;

  @ApiPropertyOptional({
    description: 'Абсолютная ссылка на обложку.',
    example: 'http://localhost:8000/storage/book/cover.jpg',
    format: 'uri',
  })
  cover?: string;

  @ApiPropertyOptional({ format: 'date-time', type: String })
  createdAt?: Date;

  @ApiPropertyOptional({ format: 'date-time', type: String })
  updatedAt?: Date;

  /**
   * Превращает сущность книги в ресурс.
   *
   * Хранилище аватаров нужно вложенному `AuthorResource`: без него авторы
   * приехали бы без ссылок на аватарки.
   */
  static make(
    book: Book,
    bookCoverStorage: BookCoverStorage,
    authorAvatarStorage: AuthorAvatarStorage,
  ): BookResource {
    const resource = new BookResource();
    resource.id = book.id.value;
    resource.title = book.title;
    resource.slug = book.slug;
    resource.isbn = book.isbn.value;
    resource.description = book.description;
    resource.authors = AuthorResource.collection(
      book.authors,
      authorAvatarStorage,
    );
    resource.category = CategoryResource.make(book.category);
    resource.price = book.price;
    resource.pages = book.pages;
    resource.year = book.year;
    resource.quantity = book.quantity;
    resource.realQuantity = book.realQuantity;
    resource.cover = bookCoverStorage.makeUrlFoPath(book.cover);
    resource.createdAt = book.createdAt;
    resource.updatedAt = book.updatedAt;
    return resource;
  }

  static collection(
    books: Book[],
    bookCoverStorage: BookCoverStorage,
    authorAvatarStorage: AuthorAvatarStorage,
  ): BookResource[] {
    return books.map((book) =>
      BookResource.make(book, bookCoverStorage, authorAvatarStorage),
    );
  }
}
```

- [ ] **Шаг 4: Обновить `book-paginated.resource.ts`**

Файл существует и до сих пор не использовался. Поправить `make`, чтобы он
принимал оба хранилища:

```ts
    static make(
        data: Book[],
        total: number,
        page: number,
        perPage: number,
        bookCoverStorage: BookCoverStorage,
        authorAvatarStorage: AuthorAvatarStorage,
    ): BookPaginatedResource {
        const resource = new BookPaginatedResource();
        resource.data = BookResource.collection(
            data,
            bookCoverStorage,
            authorAvatarStorage,
        );
        resource.meta = PaginationMetadataResource.make(total, page, perPage);
        return resource;
    }
```

Добавить импорт:

```ts
import {AuthorAvatarStorage} from "@/book/application/service/author-avatar.storage";
```

- [ ] **Шаг 5: Удалить устаревший spec**

Он вызывает `Book.create` позиционно со строковыми `author` и `category`.

```bash
git rm src/book/infrastructure/http/admin/resources/book.resource.spec.ts
```

- [ ] **Шаг 6: Проверить компиляцию**

```bash
npx tsc --noEmit -p tsconfig.json
```

Ожидается: остались только ошибки в `book.controller.ts`.

- [ ] **Шаг 7: Коммит**

```bash
git add src/book/infrastructure/http/admin/resources src/common/infrastructure/http/resources
git commit -m "feat(book): expose relations in BookResource and add error schemas"
```

---

## Task 8: Контроллер книг и OpenAPI

**Файлы:**
- Создать: `src/book/infrastructure/http/admin/book.api-docs.ts`
- Изменить: `src/book/infrastructure/http/admin/book.controller.ts`

**Интерфейсы:**
- Consumes: экшены из Task 5, ресурсы из Task 7, DTO из Task 4.
- Produces: маршруты `GET /admin/books`, `GET /admin/books/:slug`,
  `POST /admin/books`, `PATCH /admin/books/:slug`, `DELETE /admin/books/:slug`.

- [ ] **Шаг 1: Создать `book.api-docs.ts`**

Описания выносятся из контроллера отдельным модулем: в
`category.controller.ts` около 380 строк из 460 — это строковые литералы.

```ts
/** Markdown-описания эндпоинтов книг для OpenAPI. */

export const LIST_BOOKS_DESCRIPTION = `<small>

<!-- theme: info -->
> ## Описание
>
> Возвращает страницу книг вместе с метаданными пагинации. Каждая книга
> отдаётся вместе со списком авторов и категорией.

<!-- theme: info -->
> ## Фильтры
>
> | Параметр | Действие |
> |---|---|
> | \`title\` | Совпадение по части названия |
> | \`authorSlug\` | Книги указанного автора |
> | \`categorySlug\` | Книги указанной категории |
>
> Фильтр по автору не урезает список авторов внутри книги: книга по-прежнему
> отдаётся со всеми соавторами.

<!-- theme: info -->
> ## Пример
>
> \`\`\`http
> GET /api/v1/book/admin/books?authorSlug=george-orwell&page=1&per_page=15
> \`\`\`

</small>`;

export const SHOW_BOOK_DESCRIPTION = `<small>

<!-- theme: info -->
> ## Описание
>
> Возвращает одну книгу по её slug вместе с авторами и категорией.

<!-- theme: danger -->
> Если книги с таким slug нет, возвращается **404** с кодом \`RESOURCE_NOT_FOUND\`.

</small>`;

export const CREATE_BOOK_DESCRIPTION = `<small>

<!-- theme: info -->
> ## Описание
>
> Создаёт книгу и её связи. Запрос отправляется как \`multipart/form-data\`,
> потому что вместе с полями может прийти файл обложки.

<!-- theme: info -->
> ## Бизнес-правила
>
> - Категория с указанным \`categoryId\` должна существовать.
> - Все авторы из \`authorIds\` должны существовать; нужен хотя бы один.
> - ISBN не должен быть занят другой книгой.
> - Slug не должен быть занят другой книгой.
> - Slug нормализуется перед сохранением.

<!-- theme: warning -->
> ## Ошибки
>
> | Код | Статус | Причина |
> |---|---|---|
> | \`CATEGORY_NOT_EXIST\` | 400 | Категория не найдена |
> | \`AUTHOR_NOT_EXIST\` | 400 | Один или несколько авторов не найдены |
> | \`BOOK_ISBN_ALREADY_EXISTS\` | 400 | ISBN занят |
> | \`BOOK_SLUG_ALREADY_EXISTS\` | 400 | Slug занят |
> | \`BOOK_MUST_HAVE_AUTHOR\` | 400 | Список авторов пуст |
> | \`BOOK_INVALID_DATA\` | 400 | Нарушен инвариант поля |

</small>`;

export const UPDATE_BOOK_DESCRIPTION = `<small>

<!-- theme: info -->
> ## Поведение
>
> Частичное обновление: изменяются только присланные поля.
>
> | Данные запроса | Результат |
> |---|---|
> | Поле передано | Значение обновляется |
> | Поле опущено | Прежнее значение сохраняется |
> | Некорректное значение | Ошибка валидации (422) |
>
> Присланный \`authorIds\` заменяет список авторов целиком, а не дополняет его.
> Новая обложка заменяет старую, старый файл удаляется после успешного
> сохранения.

<!-- theme: info -->
> ## Бизнес-правила
>
> - Книга с указанным slug должна существовать.
> - Новый ISBN и новый slug не должны быть заняты другой книгой.
> - Присланная категория и все присланные авторы должны существовать.

</small>`;

export const DELETE_BOOK_DESCRIPTION = `<small>

<!-- theme: info -->
> ## Описание
>
> Удаляет книгу по slug. Связи с авторами удаляются вместе с ней, файл обложки
> удаляется из хранилища. Восстановить книгу нельзя.

<!-- theme: info -->
> ## Успешный ответ
>
> - **HTTP-статус:** \`204 No Content\`
> - Тело ответа пустое.

</small>`;
```

- [ ] **Шаг 2: Переписать `book.controller.ts`**

```ts
import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    Inject,
    Param,
    ParseFilePipe,
    Patch,
    Post,
    Query,
    MaxFileSizeValidator,
    FileTypeValidator,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import {FileInterceptor} from '@nestjs/platform-express';
import {
    ApiBadRequestResponse,
    ApiBody,
    ApiConsumes,
    ApiCreatedResponse,
    ApiNoContentResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiTags,
    ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';

import {CreateBookAction} from '../../../application/actions/book/create-book.action';
import {DeleteBookAction} from '../../../application/actions/book/delete-book.action';
import {FindAllBooksAction} from '../../../application/actions/book/find-all-books.action';
import {UpdateBookAction} from '../../../application/actions/book/update-book.action';
import {AuthorAvatarStorage} from '@/book/application/service/author-avatar.storage';
import {BookCoverStorage} from '@/book/application/service/book-cover.storage';
import {CreateBookDto} from '../../../application/dto/book/create-book.dto';
import {ListBooksDto} from '../../../application/dto/book/list-books.dto';
import {UpdateBookDto} from '../../../application/dto/book/update-book.dto';
import {
    BOOK_REPOSITORY,
    type IBookRepository,
} from '@/book/domain/repositories/book.repository.interface';
import {ErrorCode} from '../../../domain/exceptions/error-code.enum';
import {ResourceNotExistsException} from '@/common/domain/exceptions/resource-not-exists.exception';
import {DomainErrorResource} from '@/common/infrastructure/http/resources/domain-error.resource';
import {ValidationErrorResource} from '@/common/infrastructure/http/resources/validation-error.resource';
import {BookResource} from './resources/book.resource';
import {BookPaginatedResource} from './resources/collections/book-paginated.resource';
import {
    CREATE_BOOK_DESCRIPTION,
    DELETE_BOOK_DESCRIPTION,
    LIST_BOOKS_DESCRIPTION,
    SHOW_BOOK_DESCRIPTION,
    UPDATE_BOOK_DESCRIPTION,
} from './book.api-docs';

const COVER_MAX_BYTES = 5 * 1024 * 1024;

@Controller('/admin/books')
@ApiTags('Books')
/** Обслуживает управление книгами в админском HTTP API. */
export class BookController {
    constructor(
        @Inject(BOOK_REPOSITORY)
        private readonly bookRepository: IBookRepository,
        private readonly findAllBooks: FindAllBooksAction,
        private readonly createBook: CreateBookAction,
        private readonly updateBook: UpdateBookAction,
        private readonly deleteBook: DeleteBookAction,
        private readonly bookCoverStorage: BookCoverStorage,
        private readonly authorAvatarStorage: AuthorAvatarStorage,
    ) {
    }

    @Get()
    @HttpCode(200)
    @ApiOperation({
        operationId: 'admin.book.listAll',
        summary: 'Список книг',
        description: LIST_BOOKS_DESCRIPTION,
    })
    @ApiQuery({name: 'title', required: false, type: String, example: '1984'})
    @ApiQuery({name: 'authorSlug', required: false, type: String, example: 'george-orwell'})
    @ApiQuery({name: 'categorySlug', required: false, type: String, example: 'dystopian-fiction'})
    @ApiQuery({name: 'page', required: false, type: Number, example: 1})
    @ApiQuery({name: 'per_page', required: false, type: Number, example: 15})
    @ApiOkResponse({
        description: 'Страница книг вместе с метаданными пагинации.',
        type: BookPaginatedResource,
    })
    @ApiUnprocessableEntityResponse({
        description: 'Параметры запроса не прошли валидацию.',
        type: ValidationErrorResource,
    })
    async findAll(@Query() context: ListBooksDto) {
        const [data, total] = await this.findAllBooks.handle(context);

        return BookPaginatedResource.make(
            data,
            total,
            context.page ?? 1,
            context.per_page ?? 15,
            this.bookCoverStorage,
            this.authorAvatarStorage,
        );
    }

    @Get(':slug')
    @HttpCode(200)
    @ApiOperation({
        operationId: 'admin.book.show',
        summary: 'Книга по slug',
        description: SHOW_BOOK_DESCRIPTION,
    })
    @ApiParam({name: 'slug', type: String, required: true, example: '1984'})
    @ApiOkResponse({description: 'Книга найдена.', type: BookResource})
    @ApiNotFoundResponse({description: 'Книга не найдена.', type: DomainErrorResource})
    async findBySlug(@Param('slug') slug: string) {
        const book = await this.bookRepository.findBySlug(slug);

        if (!book) {
            throw new ResourceNotExistsException('Book not found', ErrorCode.NOT_FOUND);
        }

        return BookResource.make(book, this.bookCoverStorage, this.authorAvatarStorage);
    }

    @Post()
    @HttpCode(201)
    @UseInterceptors(FileInterceptor('cover'))
    @ApiConsumes('multipart/form-data')
    @ApiBody({type: CreateBookDto})
    @ApiOperation({
        operationId: 'admin.book.create',
        summary: 'Создать книгу',
        description: CREATE_BOOK_DESCRIPTION,
    })
    @ApiCreatedResponse({description: 'Книга создана.', type: BookResource})
    @ApiBadRequestResponse({
        description: 'Нарушено бизнес-правило.',
        type: DomainErrorResource,
    })
    @ApiUnprocessableEntityResponse({
        description: 'Тело запроса не прошло валидацию.',
        type: ValidationErrorResource,
    })
    async create(
        @Body() context: CreateBookDto,
        @UploadedFile(
            new ParseFilePipe({
                fileIsRequired: false,
                validators: [
                    new MaxFileSizeValidator({maxSize: COVER_MAX_BYTES}),
                    new FileTypeValidator({fileType: /^image\/(jpeg|png|webp)$/}),
                ],
            }),
        )
        cover?: Express.Multer.File,
    ) {
        context.withCover(cover);

        const book = await this.createBook.handle(context);

        return BookResource.make(book, this.bookCoverStorage, this.authorAvatarStorage);
    }

    @Patch(':slug')
    @HttpCode(200)
    @UseInterceptors(FileInterceptor('cover'))
    @ApiConsumes('multipart/form-data')
    @ApiBody({type: UpdateBookDto})
    @ApiOperation({
        operationId: 'admin.book.update',
        summary: 'Обновить книгу',
        description: UPDATE_BOOK_DESCRIPTION,
    })
    @ApiParam({name: 'slug', type: String, required: true, example: '1984'})
    @ApiOkResponse({description: 'Книга обновлена.', type: BookResource})
    @ApiBadRequestResponse({
        description: 'Нарушено бизнес-правило.',
        type: DomainErrorResource,
    })
    @ApiNotFoundResponse({description: 'Книга не найдена.', type: DomainErrorResource})
    @ApiUnprocessableEntityResponse({
        description: 'Тело запроса не прошло валидацию.',
        type: ValidationErrorResource,
    })
    async update(
        @Param('slug') slug: string,
        @Body() context: UpdateBookDto,
        @UploadedFile(
            new ParseFilePipe({
                fileIsRequired: false,
                validators: [
                    new MaxFileSizeValidator({maxSize: COVER_MAX_BYTES}),
                    new FileTypeValidator({fileType: /^image\/(jpeg|png|webp)$/}),
                ],
            }),
        )
        cover?: Express.Multer.File,
    ) {
        const book = await this.bookRepository.findBySlug(slug);

        if (!book) {
            throw new ResourceNotExistsException('Book not found', ErrorCode.NOT_FOUND);
        }

        const updated = await this.updateBook.handle(book, context, cover);

        return BookResource.make(updated, this.bookCoverStorage, this.authorAvatarStorage);
    }

    @Delete(':slug')
    @HttpCode(204)
    @ApiOperation({
        operationId: 'admin.book.delete',
        summary: 'Удалить книгу',
        description: DELETE_BOOK_DESCRIPTION,
    })
    @ApiParam({name: 'slug', type: String, required: true, example: '1984'})
    @ApiNoContentResponse({description: 'Книга удалена, тело ответа пустое.'})
    @ApiNotFoundResponse({description: 'Книга не найдена.', type: DomainErrorResource})
    async remove(@Param('slug') slug: string) {
        const book = await this.bookRepository.findBySlug(slug);

        if (!book) {
            throw new ResourceNotExistsException('Book not found', ErrorCode.NOT_FOUND);
        }

        await this.deleteBook.handle(book);
    }
}
```

Резолв книги повторяется в трёх методах намеренно: общий приватный хелпер связал
бы эндпоинты между собой.

- [ ] **Шаг 3: Проверить компиляцию всего проекта**

```bash
npx tsc --noEmit -p tsconfig.json && npm run build
```

Ожидается: обе команды завершаются без ошибок.

- [ ] **Шаг 4: Коммит**

```bash
git add src/book/infrastructure/http/admin
git commit -m "feat(book): move books under /admin and document the API in OpenAPI"
```

---

## Task 9: Проверка через работающее приложение

**Файлы:** изменений нет — только проверка.

**Интерфейсы:**
- Consumes: всё, что сделано в задачах 1–8.

- [ ] **Шаг 1: Поднять чистую базу и накатить миграции**

```bash
docker compose up -d mysql
docker exec -i book-shop-mysql mysql -uroot -proot \
  -e "DROP DATABASE IF EXISTS book_shop; CREATE DATABASE book_shop;"
npm run migration:run
```

- [ ] **Шаг 2: Запустить приложение**

```bash
npm run start:dev
```

Ожидается: старт без ошибок внедрения зависимостей. Отдельно проверить, что в
логе нет `Nest can't resolve dependencies of the DeleteCategoryAction` — это
означало бы, что `BOOK_CATEGORY_REPOSITORY` или `BOOK_REPOSITORY` не
зарегистрирован.

- [ ] **Шаг 3: Создать категорию и автора**

```bash
curl -sS -X POST http://localhost:8000/api/v1/book/admin/categories \
  -H 'Content-Type: application/json' \
  -d '{"title":"Dystopian fiction","slug":"Dystopian fiction"}'

curl -sS -X POST http://localhost:8000/api/v1/book/admin/authors/create \
  -F 'firstName=George' -F 'lastName=Orwell' \
  -F 'slug=george-orwell' -F 'bornDate=1903-06-25'
```

Записать `id` из обоих ответов — они понадобятся дальше.

- [ ] **Шаг 4: Создать книгу со связями**

Подставить идентификаторы из предыдущего шага.

```bash
curl -sS -X POST http://localhost:8000/api/v1/book/admin/books \
  -F 'title=1984' \
  -F 'slug=1984' \
  -F 'isbn=978-0-452-28423-4' \
  -F 'categoryId=<CATEGORY_ID>' \
  -F 'authorIds=<AUTHOR_ID>' \
  -F 'price=299' -F 'year=1949' -F 'pages=328' \
  -F 'description=Роман-антиутопия' -F 'quantity=20'
```

Ожидается: 201 и тело, в котором `authors` — массив с одним автором, а
`category` — вложенный объект с `title` и `slug`. Отдельно проверить, что
одиночный `authorIds` прошёл: именно на нём срабатывает нормализующий
`@Transform`.

- [ ] **Шаг 5: Проверить чтение и фильтры**

```bash
curl -sS 'http://localhost:8000/api/v1/book/admin/books/1984'
curl -sS 'http://localhost:8000/api/v1/book/admin/books?authorSlug=george-orwell'
curl -sS 'http://localhost:8000/api/v1/book/admin/books?categorySlug=dystopian-fiction'
curl -sS 'http://localhost:8000/api/v1/book/admin/books?page=2&per_page=5'
```

Ожидается: во всех случаях 200, связи на месте. Последний запрос отдельно
проверяет пагинацию строковыми query-параметрами — на авторах и категориях это
место сейчас отдаёт 422.

- [ ] **Шаг 6: Проверить доменные ошибки**

```bash
# Несуществующий автор
curl -sS -o /dev/null -w '%{http_code}\n' -X POST \
  http://localhost:8000/api/v1/book/admin/books \
  -F 'title=X' -F 'slug=x' -F 'isbn=1' \
  -F 'categoryId=<CATEGORY_ID>' \
  -F 'authorIds=00000000-0000-0000-0000-000000000000' \
  -F 'price=1' -F 'year=2000' -F 'pages=1' -F 'description=x' -F 'quantity=1'

# Удаление категории, за которой числится книга
curl -sS -X DELETE http://localhost:8000/api/v1/book/admin/categories/dystopian-fiction

# Несуществующая книга
curl -sS -o /dev/null -w '%{http_code}\n' \
  http://localhost:8000/api/v1/book/admin/books/no-such-book
```

Ожидается: 400 с `AUTHOR_NOT_EXIST`; 400 с `CATEGORY_HAS_BOOKS`, а не 500 от
ограничения внешнего ключа; 404 с `RESOURCE_NOT_FOUND`.

- [ ] **Шаг 7: Проверить удаление и каскад**

```bash
curl -sS -o /dev/null -w '%{http_code}\n' -X DELETE \
  http://localhost:8000/api/v1/book/admin/books/1984

docker exec -i book-shop-mysql mysql -uroot -proot book_shop \
  -e "SELECT COUNT(*) AS links FROM book_authors;"
```

Ожидается: 204 и `links = 0` — связи ушли по каскаду.

- [ ] **Шаг 8: Проверить документацию**

Открыть `http://localhost:8000/api/v1/docs` и убедиться, что:
- раздел **Books** присутствует и содержит пять операций;
- у `POST` и `PATCH` показана форма `multipart/form-data` с полем файла;
- схема `BookResource` содержит `authors` и `category` как вложенные объекты, а
  не как пустые схемы;
- у ответов 400 и 404 указана схема `DomainErrorResource`, у 422 —
  `ValidationErrorResource`.

- [ ] **Шаг 9: Финальный коммит**

```bash
git add -A
git commit -m "chore(book): verify book API relations end to end"
```

Пуш не делаем: ветка общая, отправку подтверждает человек.

---

## Замечания, оставленные вне плана

Найдены при подготовке, в скоп не входят, но стоит завести отдельно.

1. **`Uuid.generate()` не производит UUID.** Источник энтропии — случайное
   число из диапазона около 1,1 млн значений, детерминированно хэшируемое
   фиксированным ключом. Коллизия наступает примерно на 1300 записях, а
   `em.save()` с заданным первичным ключом выполняется как upsert — коллизия
   молча перезапишет чужую строку. Подробности в разделе «Риск вне скопа»
   спеки.
2. **`console.log` в рантайме.** `src/common/domain/value-objects/isbn.vo.ts:42`
   печатает результат `Isbn.generate()` при каждом импорте модуля;
   `uuid.vo.ts:16` печатает значение при каждой гидрации сущности;
   `category.controller.ts:212` печатает созданную категорию.
3. **Баги Author и Category** из первичного разбора: `rename(context.lastName)`
   в `update-author.action.ts`, отсутствие `@Type(() => Number)` в двух ListAll
   DTO, `BookAlreadyExistsException` вместо `CategoryAlreadyExistsException`,
   self-slug в `update-category.action.ts`, отсутствие валидации `bornDate` в
   `Author.create`.
4. **`docs/setup-docs.ts`** описывает проект как «Blog API» с постами, ролями и
   JWT — текст не имеет отношения к книжному магазину.
