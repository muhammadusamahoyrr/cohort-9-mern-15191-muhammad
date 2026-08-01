import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { SettingsProvider } from '../../context/SettingsContext';
import { CollectionsProvider } from '../../context/CollectionsContext';

/**
 * Renders a page the way the app does: inside a router, and inside the auth
 * provider if the page reads from it. Pass `route` for a specific URL, and
 * `extraRoutes` when the test asserts navigation and the destination needs
 * something recognisable to render.
 *
 * Settings always wrap, since preferences get read all over the note UI and
 * that is never the thing under test.
 */
export function renderWithRouter(
  ui,
  { route = '/', path = '*', extraRoutes = null, withAuth = false } = {}
) {
  const tree = (
    <MemoryRouter
      initialEntries={[route]}
      // Same flags main.jsx sets, so tests exercise the app's routing
      // behaviour and the console isn't buried in upgrade warnings.
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route path={path} element={ui} />
        {extraRoutes}
      </Routes>
    </MemoryRouter>
  );

  const withProviders = withAuth ? <AuthProvider>{tree}</AuthProvider> : tree;

  return render(
    <SettingsProvider>
      <CollectionsProvider>{withProviders}</CollectionsProvider>
    </SettingsProvider>
  );
}

/** A stand-in for whatever screen the code under test navigates to. */
export const landingRoute = (path, label) => (
  <Route key={path} path={path} element={<div>{label}</div>} />
);

export const buildNote = (overrides = {}) => ({
  id: 1,
  title: 'Standup notes',
  preview: 'Discussed the release train',
  isPinned: false,
  createdAt: '2026-07-01T09:00:00.000Z',
  updatedAt: '2026-07-02T09:00:00.000Z',
  ...overrides,
});

export const buildPagination = (overrides = {}) => ({
  page: 1,
  limit: 9,
  total: 1,
  totalPages: 1,
  ...overrides,
});
