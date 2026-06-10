import { type RouteObject, useRoutes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { publicRoutes } from './publicLayout';
import { authorizedRoutes } from './authorizedLayout';
import { ProtectedRoute, PublicRoute } from './routeConfig';
import SuspenseWrapper from '../../modules/shared/SuspenseWrapper';
import PageTransition from '../../modules/shared/PageTransition';
import { useAuth } from '../context/AuthContext';
import Footer from '../../modules/shared/Footer';

const AppRoutes = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  const routes = [
    ...publicRoutes.map((route: RouteObject) => ({
      ...route,
      element: (
        <PublicRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
          {route.element}
        </PublicRoute>
      ),
    })),
    ...authorizedRoutes.map((route: RouteObject) => ({
      ...route,
      element: (
        <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
          {route.element}
        </ProtectedRoute>
      ),
    })),
  ];

  const element = useRoutes(routes);

  return (
    <SuspenseWrapper>
        {element !== null ? (
          <PageTransition key={location.pathname}>{element}</PageTransition>
        ) : null}
    </SuspenseWrapper>
  );
};

export default AppRoutes;
