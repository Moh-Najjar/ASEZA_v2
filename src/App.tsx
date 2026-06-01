import { BrowserRouter } from 'react-router-dom';

import AppProviders from './core/context/AppProviders';
import Navbar from './modules/shared/Navbar-v2';
import AppRoutes from './core/routes';

import './App.css';
import Container from './modules/shared/Container';

/**
 * Root component.
 *
 * The Container wrapper has been removed so that:
 *  - The Login page can occupy the full viewport width with its split layout.
 *  - Each page / the Navbar manages its own max-width constraints.
 */
function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <Container>
          <Navbar />
          <AppRoutes />
        </Container>
      </BrowserRouter>
    </AppProviders>
  );
}

export default App;
