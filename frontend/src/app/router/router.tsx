import { createBrowserRouter } from 'react-router-dom';

import { adminRoutes } from './adminRoutes';
import { customerRoutes } from './customerRoutes';

export const router = createBrowserRouter([customerRoutes, adminRoutes]);
