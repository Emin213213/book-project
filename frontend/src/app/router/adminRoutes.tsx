import type { RouteObject } from 'react-router-dom';

import RolesPage from '@/pages/admin/access/RolesPage';

import { AuthorDetailPage } from '@/pages/admin/author-detail';
import { AuthorsPage } from '@/pages/admin/authors';
import { BookAddPage } from '@/pages/admin/book-add';
import { BookEditPage } from '@/pages/admin/book-edit';
import { BooksListPage } from '@/pages/admin/books-list';
import { CategoriesPage } from '@/pages/admin/categories';
import { DashboardPage } from '@/pages/admin/dashboard';
import { DiscountsPage } from '@/pages/admin/discounts';
import { FulfillmentPage } from '@/pages/admin/fulfillment';
import { ManagersPage } from '@/pages/admin/managers';
import { OrderDetailPage } from '@/pages/admin/order-detail';
import { OrdersPage } from '@/pages/admin/orders';
import { SettingsPage } from '@/pages/admin/settings';
import { SupplierOrdersPage } from '@/pages/admin/supplier-orders';
import { SuppliersListPage } from '@/pages/admin/suppliers-list';

import AdminLayout from '../layouts/AdminLayout';

export const adminRoutes: RouteObject = {
  path: 'admin',
  element: <AdminLayout />,
  children: [
    { index: true, element: <DashboardPage /> },
    { path: 'books', element: <BooksListPage /> },
    { path: 'books/add', element: <BookAddPage /> },
    { path: 'books/:slug/edit', element: <BookEditPage /> },
    { path: 'categories', element: <CategoriesPage /> },
    { path: 'authors', element: <AuthorsPage /> },
    { path: 'authors/:id', element: <AuthorDetailPage /> },
    { path: 'orders', element: <OrdersPage /> },
    { path: 'orders/:id', element: <OrderDetailPage /> },
    { path: 'discounts', element: <DiscountsPage /> },
    { path: 'suppliers', element: <SuppliersListPage /> },
    { path: 'suppliers/orders', element: <SupplierOrdersPage /> },
    { path: 'fulfillment', element: <FulfillmentPage /> },
    { path: 'managers', element: <ManagersPage /> },
    { path: 'settings', element: <SettingsPage /> },
    { path: 'roles', element: <RolesPage /> },
  ],
};
