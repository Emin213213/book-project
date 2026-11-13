# Спецификация миграции Book App на упрощённую FSD-архитектуру

## 1. Статус документа

- Статус: готово к реализации.
- Область: только архитектурное перемещение существующего frontend-кода.
- Источник принципов: [обзор Feature-Sliced Design](https://fsd.how/ru/docs/get-started/overview/).
- Обязательные локальные правила: [architecture-rules.md](./architecture-rules.md).

Этот документ описывает целевую структуру и безопасный порядок миграции. Он не требует
одновременного изменения поведения приложения, дизайна, API или состояния.

## 2. Цель

Перейти от группировки по техническому типу (`services`, `store`, `types`) и роли пользователя
(`features/admin`, `features/customer`) к группировке по бизнес-доменам.

Используется упрощённый вариант FSD из четырёх слоёв:

```text
app → pages → modules → shared
```

Слои `widgets`, `features`, `entities` и устаревший `processes` не используются. Их роль для этого
учебного проекта выполняет единый слой `modules`. Это сознательное отклонение от стандартных имён
FSD, сохраняющее главные ограничения методологии: направленные зависимости, доменные слайсы,
технические сегменты и публичный API.

## 3. Почему страницы остаются отдельным слоем

Страница представляет маршрут и собирает пользовательский сценарий из нескольких модулей.
Например, `CheckoutPage` использует корзину, пользователя, книги, скидки и заказы. Если поместить
её внутрь `cart`, модуль корзины начнёт координировать соседние домены.

Поэтому:

- `pages` знает о `modules`;
- `modules` не знает о `pages`;
- страница может использовать несколько модулей;
- модуль не импортирует другой модуль;
- маршрутизация и layouts находятся в `app`.

## 4. Целевая структура

```text
src/
├── app/
│   ├── layouts/
│   │   ├── admin-layout/
│   │   └── public-layout/
│   ├── router/
│   │   └── router.tsx
│   ├── styles/
│   │   ├── reset.css
│   │   └── variables.css
│   └── App.tsx
├── pages/
│   ├── home/
│   ├── book-details/
│   ├── favorites/
│   ├── author-details/
│   ├── cart/
│   ├── checkout/
│   ├── auth/
│   │   ├── login/
│   │   ├── register/
│   │   ├── forgot-password/
│   │   ├── reset-password/
│   │   ├── verify-email/
│   │   └── google-callback/
│   ├── profile/
│   └── admin/
│       ├── dashboard/
│       ├── books/
│       ├── book-create/
│       ├── book-edit/
│       ├── categories/
│       ├── authors/
│       ├── author-details/
│       ├── orders/
│       ├── order-details/
│       ├── discounts/
│       ├── suppliers/
│       ├── supplier-orders/
│       ├── fulfillment/
│       ├── managers/
│       └── settings/
├── modules/
│   ├── author/
│   ├── book/
│   ├── cart/
│   ├── category/
│   ├── discount/
│   ├── favorite/
│   ├── manager/
│   ├── order/
│   ├── replace-request/
│   ├── shipment/
│   ├── stock/
│   ├── stock-subscription/
│   ├── supplier/
│   ├── supplier-order/
│   └── user/
├── shared/
│   ├── assets/
│   ├── config/
│   ├── lib/
│   └── ui/
└── main.tsx
```

Папки создаются по необходимости. Пустые `api`, `model`, `ui` или `lib` заранее не создаются.

## 5. Внутренняя структура модуля

Каждая папка в `modules` — отдельный бизнес-слайс. Внутри используются FSD-сегменты:

```text
modules/book/
├── api/
│   ├── bookService.ts
│   └── books.json
├── model/
│   ├── book.types.ts
│   └── useBooksStore.ts
├── ui/
│   ├── BookCard.module.css
│   ├── BookCard.tsx
│   ├── BookForm.module.css
│   ├── BookForm.tsx
│   ├── BookGrid.module.css
│   └── BookGrid.tsx
├── lib/
│   └── price.ts
└── index.ts
```

Назначение сегментов:

- `api` — запросы, временные JSON-источники, DTO и мапперы;
- `model` — доменные типы, Zustand store, бизнес-состояние и чистая бизнес-логика;
- `ui` — компоненты, принадлежащие домену;
- `lib` — вспомогательные функции, нужные только этому модулю;
- `index.ts` — единственная точка импорта модуля извне.

## 6. Правила зависимостей

Разрешённые зависимости:

| Источник | Разрешённые цели |
|---|---|
| `app` | `pages`, `modules`, `shared` |
| `pages` | `modules`, `shared` |
| `modules/<slice>` | внутренние сегменты того же слайса, `shared` |
| `shared` | только `shared` |

Запрещены:

- импорт из верхнего слоя в нижний;
- импорт одной страницы из другой страницы;
- импорт одного модуля из другого модуля;
- глубокий импорт во внутренности модуля извне;
- общий файл `src/types/index.ts`, собирающий типы всех доменов;
- возврат к глобальным папкам `store`, `services`, `components` или `utils`.

Когда сценарий использует несколько модулей, координация остаётся в `pages`. Если координация
становится большой и повторяется, архитектура пересматривается отдельно, без преждевременного
создания нового слоя.

## 7. Публичный API

Каждый модуль экспортирует наружу только необходимый контракт:

```ts
export type { Book, BookFormData } from './model/book.types';
export { useBooksStore } from './model/useBooksStore';
export { BookCard } from './ui/BookCard';
export { BookForm } from './ui/BookForm';
export { BookGrid } from './ui/BookGrid';
export { getEffectivePrice } from './lib/price';
```

Потребитель импортирует из корня слайса, а не из его сегмента. Внутри самого слайса разрешены
прямые относительные импорты между сегментами; импортировать собственный `index.ts` нельзя, чтобы
не создавать циклы.

## 8. Карта переноса текущих файлов

### 8.1 App

| Сейчас | Цель |
|---|---|
| `src/App.tsx` | разделить на `app/App.tsx` и `app/router/router.tsx` |
| `features/admin/layouts/AdminLayout.*` | `app/layouts/admin-layout/` |
| `features/customer/layouts/PublicLayout.*` | `app/layouts/public-layout/` |
| `styles/reset.css` | `app/styles/reset.css` |
| `styles/variables.css` | `app/styles/variables.css` |
| `src/main.tsx` | оставить точкой входа, заменить только импорт `App` |

Layouts принадлежат `app`, потому что задают оболочку веток маршрутизатора. Страницы не должны
импортировать layouts.

### 8.2 Shared

| Сейчас | Цель |
|---|---|
| `components/ui/CustomSelect.*` | `shared/ui/custom-select/` |
| `components/ui/EmptyState.*` | `shared/ui/empty-state/` |
| `components/ui/Icon.tsx` | `shared/ui/icon/` |
| `components/ui/Loader.*` | `shared/ui/loader/` |
| `components/ui/Modal.*` | `shared/ui/modal/` |
| `components/ui/Pagination.*` | `shared/ui/pagination/` |
| `components/ui/PhotoUpload.*` | `shared/ui/photo-upload/` |
| `components/ui/SearchBar.*` | `shared/ui/search-bar/` |
| `assets/*` | `shared/assets/` |
| `data/constants.ts` | `shared/config/api.ts` |

`AdminCard` и `AdminHeader` сначала оцениваются по смыслу. Если они не содержат бизнес-логики,
они переходят в `shared/ui/admin-card` и `shared/ui/admin-header`. Если компонент знает о конкретном
домене, его нужно положить в соответствующий модуль, а не делать shared-компонентом.

### 8.3 Modules

| Модуль | Текущие источники |
|---|---|
| `author` | `authorService`, `useAuthorsStore`, типы автора, `authors.json` |
| `book` | `bookService`, `useBooksStore`, типы книги, `books.json`, `BookCard`, `BookGrid`, `BookForm`, `price.ts` |
| `cart` | `useCartStore`, `CartItem` |
| `category` | `categoryService`, `useCategoriesStore`, типы категории, `categories.json`, `CategoryTree` |
| `discount` | `discountService`, `useDiscountsStore`, тип скидки, `discounts.json` |
| `favorite` | `useFavoritesStore` |
| `manager` | `managerService`, `useManagersStore`, тип менеджера, `managers.json` |
| `order` | `orderService`, `useOrdersStore`, типы заказа, `orders.json` |
| `replace-request` | `replaceRequestService`, store, типы заявки, `replaceRequests.json` |
| `shipment` | `shipmentService`, `useShipmentsStore`, типы отправки |
| `stock` | `stockService`, `useStockStore`, `StockEntry` |
| `stock-subscription` | `useStockSubscriptionsStore`, `StockSubscription` |
| `supplier` | `supplierService`, `useSuppliersStore`, тип поставщика, `suppliers.json` |
| `supplier-order` | `supplierOrderService`, store, типы заказа поставщику |
| `user` | `userService`, `useUserStore`, пользовательские/auth-типы, `users.json`, `ErrorCode` |

`src/types/index.ts` удаляется только после того, как каждый тип переедет в `model` своего модуля и
все импорты будут обновлены. Типы не переносятся механически одним большим файлом.

### 8.4 Обязательные развязки существующих компонентов

Некоторые файлы нельзя просто переместить: сейчас они связывают несколько будущих модулей.

| Компонент | Текущая связь | Решение при миграции |
|---|---|---|
| `BookCard` | `book` + stores корзины и подписки | оставить отображение книги в `book/ui`, действия передавать через props/callbacks со страницы |
| `BookForm` | `book` + типы автора и категории | принимать минимальные option-структуры; страницы получают авторов/категории и передают их форме |
| `PublicLayout` | stores пользователя, корзины и избранного | layout остаётся в `app`, где такие импорты разрешены |
| `CheckoutPage` | `cart`, `order`, `user`, `book`, `discount` | оставить координацию в `pages/checkout` |
| `ProfilePage` | `user`, `order`, `replace-request`, подписки | оставить координацию в `pages/profile` |
| `OrderDetailPage` | `order`, `book`, `manager`, заявки | оставить координацию в `pages/admin/order-details` |
| `DashboardPage` | несколько административных доменов | оставить агрегацию в `pages/admin/dashboard` |

Callback здесь означает явную зависимость через props, а не доступ `book/ui` к store другого
модуля. Например, карточка сообщает `onAddToCart(bookId)`, а решение, какой store вызвать, принимает
страница. Это сохраняет направление зависимостей и делает UI проверяемым отдельно.

### 8.5 Pages

Каждый текущий `features/*/pages/*Page.tsx` переносится в отдельный слайс `pages`. Файл стилей
остаётся рядом с компонентом в сегменте `ui`:

```text
pages/checkout/
├── ui/
│   ├── CheckoutPage.module.css
│   └── CheckoutPage.tsx
└── index.ts
```

Текущий префикс `admin` сохраняется как slice group для навигации по дереву. Он не является слоем и
не даёт специального права на перекрёстные импорты страниц.

## 9. Стратегия миграции

### Этап 0. Зафиксировать исходное состояние

1. Запустить `npm run build` и записать уже существующие ошибки отдельно.
2. Запустить `npx eslint .`.
3. Вручную проверить основные публичные и административные маршруты.
4. Не исправлять функциональные или стилевые проблемы одновременно с переносом.

Критерий завершения: известен baseline, с которым сравнивается каждый следующий этап.

### Этап 1. Создать фундамент

1. Создать `app`, `pages`, `modules`, `shared`.
2. Перенести глобальные стили, assets, config и общий UI.
3. Для shared-компонентов создать публичные `index.ts` только там, где они реально упрощают API.
4. Обновить импорты и проверить сборку.

Критерий завершения: старые `components`, `styles`, `assets` и общие части `data` больше не имеют
потребителей.

### Этап 2. Переносить модули вертикальными срезами

Порядок уменьшает число временных связей:

1. `user`;
2. `author`, `category`, `book`;
3. `cart`, `favorite`, `stock-subscription`;
4. `discount`, `order`, `replace-request`;
5. `manager`, `supplier`, `supplier-order`, `stock`, `shipment`.

Для каждого модуля выполнить один и тот же цикл:

1. перенести типы в `model`;
2. перенести service и JSON в `api`;
3. перенести Zustand store в `model`;
4. перенести доменные компоненты в `ui`;
5. перенести локальные функции в `lib`;
6. определить минимальный `index.ts`;
7. обновить потребителей на публичный API;
8. выполнить build и lint;
9. только затем удалить старые файлы данного домена.

Не переносить сразу все stores, затем все services и затем все types: это сохраняет старую
горизонтальную архитектуру на время миграции и усложняет проверку.

### Этап 3. Перенести страницы

1. Создавать один page-слайс за раз.
2. Сохранять JSX и поведение; менять только контракты props, необходимые для развязки модулей.
3. Заменять импорты на публичные API модулей и shared-компонентов.
4. Оставлять межмодульную координацию на странице.
5. После каждой логической группы проверять соответствующие маршруты.

Рекомендуемые группы: auth, публичный каталог, корзина/checkout, профиль, admin catalog, admin
orders, admin supply.

### Этап 4. Перенести маршрутизацию

1. Вынести конфигурацию router из `App.tsx` в `app/router/router.tsx`.
2. Перенести layouts в `app/layouts`.
3. Импортировать страницы только через их публичный API.
4. Оставить `App.tsx` минимальным компонентом с `RouterProvider`.
5. Обновить импорт в `main.tsx`.

### Этап 5. Удалить legacy-структуру

Удалять папки только после проверки отсутствия импортов:

```text
src/components
src/data
src/features
src/services
src/store
src/styles
src/types
src/utils
```

Если папка ещё содержит используемый файл, этап не завершён.

### Этап 6. Закрепить границы

1. Проверить все импорты через `rg`.
2. Убедиться, что внешние потребители не импортируют `modules/*/api`, `model`, `ui` или `lib`.
3. Убедиться, что отсутствуют импорты `modules/<a>` → `modules/<b>`.
4. Убедиться, что страницы не импортируют другие страницы.
5. При необходимости подключить архитектурный линтер отдельной задачей, не блокируя миграцию.

## 10. Работа с пересекающимися доменными типами

Тип хранится у домена, который им владеет, а не у того, кто его отображает.

- `OrderItem` принадлежит `order`, даже если содержит `bookId`.
- `BookDiscount` принадлежит `book`, если это встроенное состояние конкретной книги.
- промокод и правила его применения принадлежат `discount`.
- `PackingListOrder` принадлежит `shipment`, даже если содержит `orderId`.

Межмодульный импорт типа всё равно запрещён. Если модулю нужен контракт другого домена, варианты
выбираются в таком порядке:

1. передать модулю примитивные данные или callback со страницы;
2. определить локальный минимальный входной тип по структурной типизации TypeScript;
3. вынести действительно общий, бизнес-независимый контракт в `shared`;
4. пересмотреть границу модулей, если два модуля постоянно меняются вместе.

Нельзя переносить все доменные типы в `shared`, чтобы обойти правило зависимостей.

## 11. Что не входит в миграцию

- изменение UI и CSS;
- замена Zustand;
- переход с JSON на настоящий backend;
- изменение URL;
- изменение форматов данных;
- массовое переименование публичных сущностей;
- добавление `features`, `widgets`, DI-контейнера или repository-слоя;
- исправление всей существующей бизнес-логики и стиля одним коммитом.

Эти изменения можно выполнить отдельными задачами после стабилизации структуры.

## 12. Риски и меры контроля

| Риск | Мера |
|---|---|
| Массовые сломанные относительные импорты | переносить по одному вертикальному модулю |
| Циклы через barrel-файлы | не импортировать собственный `index.ts` внутри слайса |
| `shared` превращается в склад | проверять отсутствие бизнес-терминов и единственного потребителя |
| Модули начинают импортировать друг друга | координировать их в page-слайсе |
| Вместе с переносом меняется поведение | сначала move-only, рефакторинг отдельным этапом |
| Старые и новые структуры живут параллельно | удалять legacy-файл после миграции каждого среза |

## 13. Критерии приёмки

Миграция завершена, когда одновременно выполнены условия:

- существуют только слои `app`, `pages`, `modules`, `shared` и точка входа `main.tsx`;
- каждый бизнес-домен находится в собственном module-слайсе;
- страницы находятся отдельно от модулей;
- router и layouts находятся в `app`;
- общие компоненты и инфраструктура находятся в `shared`;
- нет глобальных `services`, `store`, `types`, `utils`, `components`;
- нет импортов между модулями;
- нет импортов между страницами;
- внешние импорты модулей проходят через `index.ts`;
- URL и пользовательское поведение не изменились;
- `npm run build` завершается успешно;
- `npx eslint .` не добавляет новых ошибок относительно baseline;
- правила из `architecture-rules.md` пройдены полностью.

## 14. Рекомендуемый размер изменений

Один шаг миграции должен затрагивать один модуль или одну связанную группу страниц. После каждого
шага проект должен собираться. Это делает ошибку локальной и сохраняет понятную историю изменений.

Первый практический шаг после утверждения этой спецификации: перенести фундамент `shared`, не меняя
поведение компонентов.
