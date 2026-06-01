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
          <PageTransition key={location.pathname}>{route.element}</PageTransition>
        </PublicRoute>
      ),
    })),
    ...authorizedRoutes.map((route: RouteObject) => ({
      ...route,
      element: (
        <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
          <PageTransition key={location.pathname}>{route.element}</PageTransition>
        </ProtectedRoute>
      ),
    })),
  ];

  const element = useRoutes(routes);

  return (
    <SuspenseWrapper>
      <AnimatePresence mode="wait">
        {/* The key on the motion.div (inside PageTransition) handles the exit/enter cycle */}
        {element}
      </AnimatePresence>
    </SuspenseWrapper>
  );
};

export default AppRoutes;
