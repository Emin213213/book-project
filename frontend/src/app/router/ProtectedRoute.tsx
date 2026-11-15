import type { ReactElement } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useUserStore } from '@/modules/user';

/** Допускает к вложенным страницам только пользователя с локальной сессией. */
export default function ProtectedRoute(): ReactElement {
  const isAuthenticated = useUserStore((state) => state.isAuth && Boolean(state.accessToken));
  const location = useLocation();
  if (!isAuthenticated) {
    const destination = `${location.pathname}${location.search}${location.hash}`;
    return <Navigate to={`/login?redirectTo=${encodeURIComponent(destination)}`} replace />;
  }
  return <Outlet />;
}
