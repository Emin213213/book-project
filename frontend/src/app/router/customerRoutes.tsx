import type { RouteObject } from 'react-router-dom';

import { AuthorPage } from '@/pages/author';
import { ForgotPasswordPage } from '@/pages/auth/forgot-password';
import { GoogleConfirmPage } from '@/pages/auth/google-callback';
import { LoginPage } from '@/pages/auth/login';
import { RegisterPage } from '@/pages/auth/register';
import { ResetPasswordPage } from '@/pages/auth/reset-password';
import { VerifyEmailPage } from '@/pages/auth/verify-email';
import { BookDetailPage } from '@/pages/book-detail';
import { CartPage } from '@/pages/cart';
import { CheckoutPage } from '@/pages/checkout';
import { HomePage } from '@/pages/customer/home';
import { UnnauthorizedAction } from '@/pages/customer/unnauthorized-action/ui/UnnauthorizedAction.tsx';
import { FavoritesPage } from '@/pages/favorites';
import { ProfilePage } from '@/pages/profile';
import PublicLayout from '../layouts/PublicLayout';

export const customerRoutes: RouteObject = {
  element: <PublicLayout />,
  children: [
    { index: true, element: <HomePage /> },
    { path: 'book/:id', element: <BookDetailPage /> },
    { path: 'favorites', element: <FavoritesPage /> },
    { path: 'author/:id', element: <AuthorPage /> },
    { path: 'cart', element: <CartPage /> },
    { path: 'checkout', element: <CheckoutPage /> },
    { path: 'login', element: <LoginPage /> },
    { path: 'register', element: <RegisterPage /> },
    { path: 'forgot-password', element: <ForgotPasswordPage /> },
    {path:'unnauthorization-action', element:<UnnauthorizedAction/> },
    { path: 'reset-password', element: <ResetPasswordPage /> },
    { path: 'verify-email', element: <VerifyEmailPage /> },
    { path: 'profile', element: <ProfilePage /> },
    { path: 'oauth/google/callback', element: <GoogleConfirmPage /> },
  ],
};
