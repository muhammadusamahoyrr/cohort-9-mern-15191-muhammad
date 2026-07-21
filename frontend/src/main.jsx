import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';

// Self-hosted so the app renders the same offline and nothing is requested
// from a font CDN. Only the axes actually used are pulled in.
import '@fontsource-variable/newsreader/wght.css';
import '@fontsource-variable/newsreader/wght-italic.css';
import '@fontsource-variable/public-sans/wght.css';

import './styles/tokens.css';
import './styles/base.css';
import './styles/shell.css';
import './styles/notes.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      {/* Opt in to the v6.4+ behaviour now — it silences the upgrade warnings
          and there is nothing here that depends on the old semantics. */}
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);
