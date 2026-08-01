import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { CollectionsProvider } from './context/CollectionsContext';

// self-hosted, so no font CDN request and it looks the same offline
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
      {/* v7 flags on now. Nothing here relies on the old behaviour and it
          shuts up the upgrade warnings. */}
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <SettingsProvider>
          <CollectionsProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
          </CollectionsProvider>
        </SettingsProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);
