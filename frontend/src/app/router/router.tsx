import { createBrowserRouter } from 'react-router-dom';

import { adminRoutes } from './adminRoutes';
import { customerRoutes } from './customerRoutes';
import ProtectedRoute from './ProtectedRoute';

export const router = createBrowserRouter([
  customerRoutes,
  { element: <ProtectedRoute />, children: [adminRoutes] },
]);
