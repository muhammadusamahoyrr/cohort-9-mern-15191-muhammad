import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';

/**
 * Renders a page the way the app does — inside a router, and inside the auth
 * provider when the page reads from it. Tests that need a specific URL pass
 * `route`; tests that assert navigation pass `extraRoutes` to give the
 * destination something recognisable to render.
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

  return render(withAuth ? <AuthProvider>{tree}</AuthProvider> : tree);
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
