import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';
import useAuth from '../../hooks/useAuth';

jest.mock('../../hooks/useAuth');

const renderGuard = (session) => {
  useAuth.mockReturnValue({ loading: false, token: null, ...session });

  return render(
    <MemoryRouter
      initialEntries={['/private']}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route
          path="/private"
          element={
            <ProtectedRoute>
              <p>secret note</p>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<p>login screen</p>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('ProtectedRoute', () => {
  it('renders the page when there is a token', () => {
    renderGuard({ token: 'abc.123' });
    expect(screen.getByText('secret note')).toBeInTheDocument();
  });

  it('sends an anonymous visitor to the login screen', () => {
    renderGuard({ token: null });
    expect(screen.getByText('login screen')).toBeInTheDocument();
  });

  it('waits instead of redirecting while the stored token is being checked', () => {
    // Redirecting here would flash the login screen on every refresh.
    renderGuard({ token: 'abc.123', loading: true });

    expect(screen.queryByText('login screen')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
