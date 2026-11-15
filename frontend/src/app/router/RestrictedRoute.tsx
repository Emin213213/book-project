import type { ReactElement } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useUserStore } from '@/modules/user';
import { getAuthRedirect } from './authRedirect';

/** Перенаправляет авторизованного пользователя со страниц входа и регистрации. */
export default function RestrictedRoute(): ReactElement {
  const isAuthenticated = useUserStore((state) => state.isAuth && Boolean(state.accessToken));
  const location = useLocation();
  return isAuthenticated ? <Navigate to={getAuthRedirect(location.search)} replace /> : <Outlet />;
}
