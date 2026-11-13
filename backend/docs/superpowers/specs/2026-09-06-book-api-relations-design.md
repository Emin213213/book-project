# Рефакторинг Book API: связи и OpenAPI

Дата: 2026-09-06
Статус: утверждён, готов к плану реализации

## Цель

Привести Book API к тому же стилю, в котором сделаны Author и Category, заменить
строковые поля `books.author` и `books.category` на реальные связи и закрыть
OpenAPI-документацию модуля.

Сегодня книги — единственный ресурс модуля без Swagger-разметки: `BookResource`
не имеет ни одного `@ApiProperty`, `BookController` не имеет ни одного
`@ApiOperation`. В спецификации книги присутствуют как пустые схемы.

## Принятые решения

| Развилка | Решение |
|---|---|
| Кардинальность | ManyToMany авторы, ManyToOne категория |
| Адресация | Путь по `slug`, тело запроса по UUID |
| Данные | Чистый снос: база dev, в `books` данных нет |
| Резолв связей | Модель из пути — в контроллере; связи из тела — в экшене |
| Уникальность | Только кодом, уникальных индексов в БД не заводим |
| Миграции | Старые удаляются целиком, набор пересобирается с нуля |
| Модель `Book` | Богатая: инварианты и поведение внутри сущности |
| Дублирование в контроллере | Допускается: резолв инлайнится в каждом методе, приватных хелперов нет |
| Тесты | Не пишем |

Правило резолва формулируется так: **модель, адресуемая путём, ищется в
контроллере и приезжает в экшен объектом; связи, пришедшие в теле, резолвятся
внутри экшена.** Так уже написан `AuthorController.update`.

Дублирование резолва в контроллере — сознательная плата за то, чтобы методы
эндпоинтов не были связаны между собой. Общий приватный метод не вводим.

## Схема данных

### Почему набор миграций пересобирается

Текущая цепочка не разворачивается на чистой базе. Миграция
`1785658717730` создаёт `authors` без колонки `status`, а следующая за ней
`AddAuthorStatus1786117398924` выполняет `ALTER TABLE authors MODIFY status ...`
и падает с ошибкой 1054 «Unknown column 'status'». То есть поднять проект с нуля
сегодня невозможно в принципе.

К этому добавляется остальное: девять из одиннадцати файлов называются
`<timestamp>-$npm_config_name.ts`, потому что `npm run migration:create --name=`
не подставил переменную; классы внутри называются `$npmConfigName<timestamp>`, а
поле `name` содержит эту же строку с ведущим пробелом. Схема размазана по
инкрементам, из которых часть отменяет предыдущие: `books.year` создаётся как
`int`, затем меняется на `date`; `users.firstName` создаётся `NOT NULL`, затем
делается `NULL`.

Поэтому все одиннадцать файлов в `migrations/` удаляются и заменяются набором из
шести, по одной таблице на файл.

Вместе со старыми файлами удаляется и единственная data-миграция
`1786890000000-normalize-author-avatar-paths.ts`, которая заменяла обратные слэши
в `authors.avatar`. На пустой базе она вырождается в no-op, поэтому потери нет —
но удаление осознанное, а не по недосмотру.

### Новый набор

Порядок задан зависимостями: `session` ссылается на `users`, `books` — на
`categories`, `book_authors` — на `books` и `authors`.

| # | Файл | Ответственность |
|---|---|---|
| 1 | `1788652800000-create-users-table.ts` | Таблица `users` |
| 2 | `1788652810000-create-sessions-table.ts` | Таблица `session` и FK на `users` |
| 3 | `1788652820000-create-categories-table.ts` | Таблица `categories` |
| 4 | `1788652830000-create-authors-table.ts` | Таблица `authors` |
| 5 | `1788652840000-create-books-table.ts` | Таблица `books` и FK на `categories` |
| 6 | `1788652850000-create-book-authors-table.ts` | Join-таблица `book_authors` и оба FK |

Каждая миграция отвечает ровно за одну таблицу. Внешний ключ живёт в той
миграции, которая создаёт владеющую им колонку, — отдельных миграций «только под
констрейнты» не заводим: на шести таблицах это разносит связанные изменения по
файлам без выигрыша.

### Имена колонок

Проект не использует naming strategy, поэтому имена колонок берутся из сущностей
буква в букву. В `users` это `firstName`, `lastName`, `createdAt`, `updatedAt` в
camelCase рядом с `password_reset_token` и `email_verified_at` в snake_case; в
`session` — `accessTokenValidUntil` рядом с `access_token` и `user_id`. Смесь
некрасивая, но это существующий контракт модуля авторизации: любое
переименование ломает `user`, а он вне скопа.

В таблицах `books`, `authors`, `categories` всё в snake_case — там смеси нет.

### Стиль файлов

Сырой SQL в многострочных шаблонных литералах с выровненными колонками, над
каждым классом — JSDoc с ответственностью миграции. Query Builder API
(`queryRunner.createTable(new Table(...))`) не берём: `enum`, `datetime(6)` и
`ON UPDATE CURRENT_TIMESTAMP(6)` выражаются в нём многословно и неточно, а
читаемость выигрывает у явного SQL.

Класс называется по смыслу, поле `name` не задаётся — TypeORM возьмёт имя
класса. Образец, по которому пишутся остальные пять:

```ts
import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Создаёт таблицу `categories`.
 *
 * Категория — справочник верхнего уровня: у неё нет внешних ключей, и она
 * создаётся раньше `books`, которая на неё ссылается.
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

### Схема целиком

**1. `users`** — учётные записи. Единственный UNIQUE-индекс во всей схеме:
`email` объявлен `unique: true` в сущности и на нём держится авторизация.
Решение «уникальность ловим кодом» касается `isbn` и `slug`, а не почты.

```sql
CREATE TABLE `users` (
    `id`                                  varchar(36)  NOT NULL,
    `firstName`                           varchar(255) NULL,
    `lastName`                            varchar(255) NULL,
    `email`                               varchar(255) NOT NULL,
    `password`                            varchar(255) NULL,
    `password_reset_token`                varchar(255) NULL,
    `email_verification_token`            varchar(255) NULL,
    `email_verification_token_expires_at` timestamp    NULL,
    `email_verified_at`                   timestamp    NULL,
    `createdAt`                           datetime(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt`                           datetime(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
                                                       ON UPDATE CURRENT_TIMESTAMP(6),
    UNIQUE INDEX `UQ_users_email` (`email`),
    PRIMARY KEY (`id`)
) ENGINE=InnoDB
```

**2. `session`** — активные сессии. Имя таблицы единственного числа, как в
`@Entity({ name: 'session' })`.

```sql
CREATE TABLE `session` (
    `id`                    varchar(36)  NOT NULL,
    `user_id`               varchar(36)  NOT NULL,
    `access_token`          varchar(255) NOT NULL,
    `accessTokenValidUntil` timestamp    NOT NULL,
    `createdAt`             timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt`             timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
                                         ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (`id`),
    CONSTRAINT `FK_session_user` FOREIGN KEY (`user_id`)
        REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION
) ENGINE=InnoDB
```

**3. `categories`** — см. образец выше.

**4. `authors`** — колонка `status` создаётся сразу вместе с таблицей. Именно её
отсутствие ломает текущую цепочку.

```sql
CREATE TABLE `authors` (
    `id`         varchar(36)  NOT NULL,
    `first_name` varchar(255) NOT NULL,
    `last_name`  varchar(255) NOT NULL,
    `slug`       varchar(255) NOT NULL,
    `status`     enum('DRAFT','PUBLISHED','ARCHIVED') NOT NULL DEFAULT 'DRAFT',
    `born_date`  datetime     NOT NULL,
    `avatar`     varchar(255) NULL,
    `created_at` datetime(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at` datetime(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
                              ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (`id`)
) ENGINE=InnoDB
```

**5. `books`** — без строковых `author` и `category`, с `slug`, `category_id` и
`cover`. `year` создаётся как `int`.

```sql
CREATE TABLE `books` (
    `id`            varchar(36)   NOT NULL,
    `isbn`          varchar(17)   NOT NULL,
    `slug`          varchar(255)  NOT NULL,
    `title`         varchar(255)  NOT NULL,
    `description`   longtext      NULL,
    `category_id`   varchar(36)   NOT NULL,
    `price`         decimal(12,6) NOT NULL,
    `pages`         int           NOT NULL,
    `year`          int           NOT NULL,
    `quantity`      int           NOT NULL DEFAULT 0,
    `real_quantity` int           NOT NULL DEFAULT 0,
    `cover`         varchar(255)  NULL,
    `created_at`    datetime(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updated_at`    datetime(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
                                  ON UPDATE CURRENT_TIMESTAMP(6),
    PRIMARY KEY (`id`),
    CONSTRAINT `FK_books_category` FOREIGN KEY (`category_id`)
        REFERENCES `categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB
```

**6. `book_authors`** — связь книги с авторами.

```sql
CREATE TABLE `book_authors` (
    `book_id`   varchar(36) NOT NULL,
    `author_id` varchar(36) NOT NULL,
    PRIMARY KEY (`book_id`, `author_id`),
    CONSTRAINT `FK_book_authors_book` FOREIGN KEY (`book_id`)
        REFERENCES `books`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `FK_book_authors_author` FOREIGN KEY (`author_id`)
        REFERENCES `authors`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB
```

### Про индексы и каскады

Уникальных индексов на `books.isbn`, `books.slug`, `authors.slug` и
`categories.slug` нет — уникальность проверяется в коде. `PRIMARY KEY (book_id,
author_id)` остаётся: он структурный, иначе одного автора можно привязать к
книге дважды. Обычные индексы под внешние ключи InnoDB создаёт сам, объявлять их
не нужно.

`ON DELETE CASCADE` стоит только на `book_authors.book_id`: удаление книги должно
уносить её связи. На `category_id` и `author_id` стоит `RESTRICT` — удаление
категории или автора, за которыми числятся книги, должно падать, а не тащить
каскад по каталогу.

### Проверка миграций

Обязательный шаг, выполняется до перехода к коду приложения.

1. `docker compose up -d mysql`
2. Пересоздать схему — таблица `migrations` в текущей dev-базе хранит записи об
   удалённых файлах, а сами таблицы уже существуют, поэтому `CREATE TABLE`
   столкнётся с ними:
   `docker exec -i book-shop-mysql mysql -uroot -proot -e "DROP DATABASE IF EXISTS book_shop; CREATE DATABASE book_shop;"`
3. `npm run migration:run` — все шесть применяются без ошибок.
4. Сверить результат с сущностями: `SHOW CREATE TABLE` по каждой из шести
   таблиц; проверить имена колонок, `enum` у `authors.status`, оба FK у
   `book_authors` и правила `ON DELETE`.
5. Проверить обратимость: `npm run migration:revert` шесть раз подряд, база
   должна остаться пустой, кроме служебной таблицы `migrations`.
6. Повторный `npm run migration:run` — цепочка должна примениться заново на
   чистой базе.
7. Убедиться, что в `dist/migrations` не осталось скомпилированных старых
   файлов: `data-source.ts` подхватывает и `.ts`, и `.js`.

Шаги 3–6 проверяют схему в отрыве от приложения. Финальная проверка через API
идёт после реализации: создать категорию, автора и книгу, прочитать книгу и
убедиться, что связи отдаются.

## Домен

### `Book`

Убираются поля `authorValue: string` и `categoryValue: string`. Добавляются:

```ts
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

@Column({ name: "slug", length: 255 })
private slugValue: string;
```

`referencedColumnName` указывает имя свойства, а не колонки, поэтому с обеих
сторон `idValue`.

Новые геттеры `authors`, `category`, `slug`. Новые методы `changeAuthors()`,
`changeCategory()`, `changeSlug()`. Инвариант: пустой массив авторов запрещён —
`BookMustHaveAuthorException`.

### `year` становится `int`

Сегодня дрейфа нет: миграция `1783240595291` меняет колонку на `date`, и
сущность с её `@Column({ type: "date" })` базе соответствует. Это упрощение, а
не почин.

Год издания — это год, а не дата. Хранение его как `1949-01-01` заставляет
`changePublicationYear` писать `new Date(Date.UTC(year, 0, 1))`, а геттер `year`
— разбирать две формы, потому что MySQL отдаёт `DATE` строкой `'YYYY-MM-DD'`, а
свежесозданное значение остаётся объектом `Date`. Обе ветки живут в сущности
только ради формата колонки.

Раз набор миграций пересобирается, колонка создаётся как `int`, а в сущности
остаётся `@Column({ name: "year", type: "int" })` над `private yearValue:
number`. `changePublicationYear` только валидирует и присваивает,
геттер становится тривиальным.

### `Book.create`

Переходит на объект-параметр вместо позиционных аргументов: со связями их стало
бы двенадцать.

```ts
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

static create(props: BookProps): Book
```

Это осознанный отход от позиционного `Author.create`.

### Богатая модель

`Book` остаётся богатой доменной моделью на уровне `Author`, а не сползает в
контейнер данных при появлении связей.

Практически это значит следующее. Все поля приватные (`authorsValue`,
`categoryValue`, `slugValue`), наружу торчат только геттеры. Публичных сеттеров
нет: состояние меняется исключительно доменными методами `changeAuthors`,
`changeCategory`, `changeSlug`, `changeTitle`, `changeIsbn`, `changePrice`,
`changeQuantity`, `changePublicationYear`, `changePages`, `changeDescription`,
`changeCover`, `removeCover`. Инварианты проверяются внутри этих методов, а не в
экшенах и не в DTO: пустой заголовок, неположительная цена, отрицательное
количество, пустой массив авторов — всё отбивается сущностью.

`Book.create` собирает объект только через эти же методы, поэтому созданная
книга не может оказаться в невалидном состоянии.

Экшен не имеет права присвоить связь напрямую: он резолвит `Author[]` и
`Category`, передаёт их в `changeAuthors` / `changeCategory` и получает
`BookMustHaveAuthorException`, если список авторов пуст.

Статус-лайфсайкл (`DRAFT` / `PUBLISHED` / `ARCHIVED`) как у `Author` не
добавляется: у `Category` его тоже нет, а публикационного workflow для книг
задача не требует. Если он понадобится, это отдельная колонка и отдельная
миграция.

### Исключения

Голые `Error` в `book.entity.ts` летят мимо `DomainExceptionFilter` и дают 500
там, где нужен 400. Заменяются на `InvalidBookDataException(field, rule)` —
наследник `DomainException`, сообщение собирается через существующий
`StrHelper.sprintf`.

Новые значения в `book/domain/exceptions/error-code.enum.ts`:

```
BOOK_SLUG_ALREADY_EXISTS
BOOK_MUST_HAVE_AUTHOR
BOOK_INVALID_DATA
AUTHOR_NOT_EXIST
CATEGORY_HAS_BOOKS
```

Новые классы исключений: `BookSlugAlreadyExistsException`,
`BookMustHaveAuthorException`, `InvalidBookDataException`,
`AuthorNotExistException`, `CategoryHasBooksException`.

## Порты и репозитории

### `IBookRepository`

```ts
findById(id: Uuid): Promise<Book | null>;
findBySlug(slug: string): Promise<Book | null>;
findByIsbn(isbn: Isbn): Promise<Book | null>;
existsByCategory(categoryId: Uuid): Promise<boolean>;
createBaseQuery(): SelectQueryBuilder<Book>;
applyTitleFilter(qb: SelectQueryBuilder<Book>, title: string): void;
applyAuthorFilter(qb: SelectQueryBuilder<Book>, authorSlug: string): void;
applyCategoryFilter(qb: SelectQueryBuilder<Book>, categorySlug: string): void;
```

`createBaseQuery()` добавляет `leftJoinAndSelect` на `authorsValue` и
`categoryValue` — без этого ресурс отдаст `undefined` вместо связей. Пути в
query builder идут по именам свойств.

`applyAuthorFilter` перестаёт быть `LIKE` по строке и фильтрует по `slug`
автора через join. `applyCategoryFilter` — новый, по `slug` категории.

### `IAuthorRepository`

Добавляются `findById(id: Uuid)` и `findManyByIds(ids: Uuid[]): Promise<Author[]>`.

### `ICategoryRepository`

Добавляются `findById(id: Uuid)` и `createBaseQuery()`.

Токен `BOOK_CATEGORY_REPOSITORY` объявлен и импортирован в `book.module.ts`, но
нигде не регистрируется, из-за чего четыре category-экшена зависят от
конкретного класса. Регистрируем:

```ts
{ provide: BOOK_CATEGORY_REPOSITORY, useExisting: CategoryRepository }
```

и переводим `CreateCategoryAction`, `ListAllCategoriesAction`,
`UpdateCategoryAction`, `DeleteCategoryAction` на порт. Книгам порт категорий
нужен для резолва, поэтому доводим до конца.

## Экшены

Экшенов остаётся четыре.

### `CreateBookAction.handle(context: CreateBookDto): Promise<Book>`

1. Если пришёл файл обложки — сохраняется **до** транзакции. При любой ошибке
   ниже файл удаляется компенсирующим `deleteFile` в `catch`. Сетевой и
   дисковый IO не держит коннект пула, а ответ API остаётся консистентным.
2. Транзакция:
   - резолв категории по `context.categoryId` → `CategoryNotExistException`;
   - резолв авторов через `findManyByIds`; если найдено меньше, чем прислано —
     `AuthorNotExistException` с перечнем ненайденных id;
   - проверка `isbn` через `em` транзакции → `BookIsbnAlreadyExistException`;
   - проверка `slug` через `em` транзакции → `BookSlugAlreadyExistsException`;
   - `Book.create({ ... })`, `em.save(book)`.

Проверки уникальности идут через `em` транзакции, а не через
`this.bookRepository` с его собственным менеджером. Индексов в БД нет, поэтому
узкое окно проверки — единственная защита от дублей.

### `UpdateBookAction.handle(book: Book, context: UpdateBookDto): Promise<Book>`

Книга приезжает из контроллера. В транзакции:

- резолв только присланных связей: `categoryId` → `changeCategory`,
  `authorIds` → `changeAuthors`;
- проверка уникальности `isbn` и `slug` **с исключением самой книги** —
  сравнение по `id`, иначе PATCH с текущим значением падает (та же ошибка, что
  сейчас в `update-category.action.ts`);
- при замене обложки старый файл удаляется через `deleteFile`;
- `em.save(book)`.

### `DeleteBookAction.handle(book: Book): Promise<void>`

Удаляет строку и файл обложки. Сейчас файл остаётся на диске навсегда.

### `FindAllBooksAction.handle(context: ListBooksDto): Promise<[Book[], number]>`

Фильтры `title`, `authorSlug`, `categorySlug` плюс пагинация.

### Правка вне книг

`DeleteCategoryAction` получает проверку `IBookRepository.existsByCategory()` и
кидает `CategoryHasBooksException` (400). Без неё `ON DELETE RESTRICT` вернёт
ошибку FK от MySQL и превратится в 500. Это прямое следствие введения FK.

## DTO

### `CreateBookDto`

Уходят `author` и `category`. Приходят:

```ts
@Transform(({ value }) => Str.slug(value))
@IsString() @IsNotEmpty()
slug: string;

@IsUUID()
categoryId: string;

@Transform(({ value }) => (Array.isArray(value) ? value : [value]))
@ArrayNotEmpty()
@IsUUID(undefined, { each: true })
authorIds: string[];
```

`@IsUUID()` идёт **без указания версии**. `Uuid.generate()` не производит
UUID v4 (см. раздел «Риск вне скопа»), поэтому `@IsUUID('4')` отбраковал бы
каждый идентификатор, который выдаёт система. Без версии class-validator
проверяет только форму `8-4-4-4-12` из hex-символов, и это проходит.

Нормализующий `@Transform` на `authorIds` обязателен: в `multipart/form-data`
одиночное значение приходит строкой, а не массивом из одного элемента, и без
нормализации создание книги с одним автором падает на `@ArrayNotEmpty`.

`cover` перестаёт быть `any`: `@IsOptional() cover?: Express.Multer.File`.
Сейчас строка в этом поле доезжает до `path.extname(undefined)` и даёт 500.

### `UpdateBookDto`

```ts
export class UpdateBookDto extends PartialType(
  OmitType(CreateBookDto, ['cover'] as const),
) {}
```

Как `UpdateAuthorDto` и `UpdateCategoryDto`. Ручной дубль уезжает вместе с полем
`stock`, которого нет ни в домене, ни в БД — везде оно `quantity`.

### `ListBooksDto`

Наследуется от `PaginationQueryDto` из `common/application/dto` — там уже
корректные `@Type(() => Number)`. Добавляет `title?`, `authorSlug?`,
`categorySlug?`.

## HTTP-слой

### Маршруты

`@Controller('books')` → `@Controller('/admin/books')`. Сейчас с префиксом
`RouterModule` получается `/api/v1/book/books`, тогда как у авторов и категорий
— `/api/v1/book/admin/authors` и `/admin/categories`.

| Метод | Путь | Ответ |
|---|---|---|
| GET | `/admin/books` | 200, `BookPaginatedResource` |
| GET | `/admin/books/:slug` | 200, `BookResource` |
| POST | `/admin/books` | 201, `BookResource` |
| PATCH | `/admin/books/:slug` | 200, `BookResource` |
| DELETE | `/admin/books/:slug` | 204 |

`PUT` меняется на `PATCH` — как у авторов и категорий.

В `GET /:slug`, `PATCH /:slug` и `DELETE /:slug` резолв книги пишется прямо в
теле метода: `findBySlug`, затем `ResourceNotExistsException` при `null`.
Дублирование допускается сознательно.

`POST` и `PATCH` используют `FileInterceptor('cover')` и `ParseFilePipe` с
ограничениями по mime-типу и размеру.

Контроллер переходит на `BookPaginatedResource` — класс написан и не
используется, вместо него сейчас вызывается generic `PaginatedResource`.

### `BookResource`

Получает `@ApiProperty` на каждое поле. Добавляются:

```ts
@ApiProperty({ isArray: true, type: () => AuthorResource })
authors: AuthorResource[];

@ApiProperty({ type: () => CategoryResource })
category: CategoryResource;

@ApiProperty()
slug: string;
```

Сигнатура становится `make(book, coverStorage, avatarStorage)` — вложенный
`AuthorResource.make` требует `AuthorAvatarStorage`, иначе авторы приедут без
аватарок.

Поля `stock` и `realStock` переименовываются в `quantity` и `realQuantity`: раз
`stock` уходит из DTO, держать его в ответе — рассинхрон.

### OpenAPI

- `@ApiTags('Books')` на контроллере.
- `@ApiOperation` с operationId `admin.book.listAll`, `admin.book.show`,
  `admin.book.create`, `admin.book.update`, `admin.book.delete`. В модуле сейчас
  три несовместимых схемы именования; авторов и категории не трогаем.
- `@ApiConsumes('multipart/form-data')` и явный `@ApiBody({ type: ... })` на
  `POST` и `PATCH`. Без этого Swagger не отрисует форму загрузки.
- `@ApiQuery` на `title`, `authorSlug`, `categorySlug`, `page`, `per_page`.
- `@ApiParam` на `slug`.
- Полный набор ответов на каждый эндпоинт: `@ApiOkResponse` /
  `@ApiCreatedResponse` / `@ApiNoContentResponse` с типами,
  `@ApiUnprocessableEntityResponse` (валидация — 422, см. `main.ts`),
  `@ApiBadRequestResponse` (доменные ошибки — 400), `@ApiNotFoundResponse`.

Два новых схема-класса вместо прозы:

```ts
// common/infrastructure/http/resources/validation-error.resource.ts
class ValidationErrorResource {
  message: string;                        // 'Validation failed'
  errors: Record<string, string[]>;
}

// common/infrastructure/http/resources/domain-error.resource.ts
class DomainErrorResource {
  statusCode: number;
  errorCode: string;
  message: string;
}
```

Формы соответствуют `exceptionFactory` в `main.ts` и `DomainExceptionFilter`.
Сегодня формат ошибок описан только markdown-текстом внутри
`@ApiBadRequestResponse` у категорий, машиночитаемой схемы в спецификации нет.

Markdown-описания эндпоинтов выносятся в отдельный файл `book.api-docs.ts`
константами. `category.controller.ts` — 460 строк, из которых около 380 это
строковые литералы описаний; повторять это в книгах не нужно.

## Что не входит

Пересборка миграций затрагивает `users` и `session`, но только структурно:
таблицы воссоздаются с той же схемой, к которой их приводила старая цепочка
инкрементов. Код модуля `user` не трогается. Единственное содержательное
изменение **схемы** за пределами книг — колонка `authors.status`, которая теперь
создаётся вместе с таблицей: без этого цепочка не разворачивается на чистой базе.

Изменения **кода** за пределами книг ограничены двумя пунктами, и оба описаны
выше: регистрация токена `BOOK_CATEGORY_REPOSITORY` с переводом четырёх
category-экшенов на порт и проверка `existsByCategory` в `DeleteCategoryAction`.
Оба — прямые следствия введения FK и порта категорий.


- Баги Author и Category, найденные при анализе: `rename(context.lastName)` в
  `update-author.action.ts`, отсутствие `@Type(() => Number)` в двух ListAll
  DTO, `BookAlreadyExistsException` вместо `CategoryAlreadyExistsException` в
  `create-category.action.ts`, self-slug в `update-category.action.ts`,
  отсутствие валидации `bornDate` в `Author.create`. Отдельной задачей.
- Устаревшее описание API в `docs/setup-docs.ts` — там всё ещё «Blog API» с
  постами, ролями и JWT.
- Тесты.

## Риск вне скопа

`Uuid.generate()` в `src/common/domain/value-objects/uuid.vo.ts` не генерирует
UUID:

```ts
const random = Math.floor(Math.random() * (100000 + 999999 + 1)) + 100000
const hash = createHmac('sha256', 'avevewcve').update(random.toString()).digest("hex")
```

Источник энтропии — случайное число из диапазона примерно в 1,1 млн значений,
детерминированно хэшируемое фиксированным ключом. Это около 20 бит энтропии
вместо 122. Коллизия по парадоксу дней рождения наступает примерно на 1300
записях: при тысяче книг вероятность дубля близка к 50%.

Почему это важно именно здесь: `em.save()` с уже установленным первичным ключом
выполняется как upsert — TypeORM делает SELECT, находит существующую строку и
превращает вставку в UPDATE. То есть коллизия идентификатора **молча перезапишет
чужую книгу** вместо ошибки. Этими же идентификаторами связывается
`book_authors`, поэтому цена коллизии растёт вместе со связями.

Дополнительно: `Uuid.isValid` проверяет только длины сегментов, но не то, что
символы шестнадцатеричные, а конструктор печатает `console.log(value, 'uuid')`
при каждой гидрации сущности.

Чинить в рамках этой задачи не предлагается — скоп ограничен книгами, а `Uuid`
лежит в `common` и используется всеми модулями, включая `user`. Выношу
отдельной задачей.

## Открытый вопрос

Три существующих spec-файла описывают поведение, которое эта работа удаляет, и
после рефакторинга перестанут компилироваться:

- `src/book/domain/entities/book.entity.spec.ts` — оба теста разбирают
  `yearValue` как дату; ветка уходит вместе с переводом колонки в `int`;
- `src/book/infrastructure/http/admin/resources/book.resource.spec.ts` —
  позиционный `Book.create` со строковыми `author` и `category`;
- `src/book/application/dto/book/create-book.dto.spec.ts` — поля `author` и
  `category`.

Раз тесты не пишем, предлагаю удалить эти три файла в рамках работы, иначе
`npm test` перестанет проходить. Решение за тобой — альтернатива в том, чтобы
починить их минимально под новый контракт.
