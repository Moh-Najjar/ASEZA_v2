import React from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';

import AppProviders from './core/context/AppProviders';
import Navbar from './modules/shared/Navbar-v2';
import AppRoutes from './core/routes';
import AppTour from './modules/shared/AppTour';

import './App.css';
import Container from './modules/shared/Container';

/**
 * Conditionally renders the regular Navbar + Container shell.
 * Admin routes (/admin/*) supply their own full-page layout so the
 * regular Navbar and container max-width must not appear.
 */
const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <Container>
      <Navbar />
      {children}
    </Container>
  );
};

/**
 * Root component.
 *
 * The Container wrapper has been removed so that:
 *  - The Login page can occupy the full viewport width with its split layout.
 *  - Each page / the Navbar manages its own max-width constraints.
 *  - Admin pages render with their own full-page layout (no regular Navbar).
 */
function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        {/* AppTour uses react-router hooks so it must live inside BrowserRouter. */}
        <AppTour />
        <AppShell>
          <AppRoutes />
        </AppShell>
      </BrowserRouter>
    </AppProviders>
  );
}

export default App;
