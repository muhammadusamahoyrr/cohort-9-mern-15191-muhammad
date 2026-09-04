import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';

export function renderWithRouter(
  ui,
  { route = '/', path = '*', extraRoutes = null, withAuth = false } = {}
) {
  const tree = (
    <MemoryRouter
      initialEntries={[route]}
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
