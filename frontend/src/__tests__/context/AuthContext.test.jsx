import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '../../context/AuthContext';
import useAuth from '../../hooks/useAuth';
import * as authApi from '../../api/auth.api';

jest.mock('../../api/auth.api');

const TOKEN_KEY = 'notes.token';

function Probe() {
  const { user, token, loading, login, logout } = useAuth();

  if (loading) return <p>loading</p>;

  return (
    <div>
      <p>user: {user ? user.name : 'none'}</p>
      <p>token: {token ?? 'none'}</p>
      <button onClick={() => login({ email: 'a@b.co', password: 'Passw0rd' })}>log in</button>
      <button onClick={logout}>log out</button>
    </div>
  );
}

const renderProbe = () =>
  render(
    <AuthProvider>
      <Probe />
    </AuthProvider>
  );

describe('AuthProvider', () => {
  it('starts with no session when localStorage is empty', async () => {
    renderProbe();

    expect(await screen.findByText('user: none')).toBeInTheDocument();
    expect(authApi.me).not.toHaveBeenCalled();
  });

  it('hydrates the user from a stored token on mount', async () => {
    localStorage.setItem(TOKEN_KEY, 'stored.token');
    authApi.me.mockResolvedValue({ user: { id: 1, name: 'Ada Lovelace' } });

    renderProbe();

    expect(await screen.findByText('user: Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('token: stored.token')).toBeInTheDocument();
  });

  it('drops a token the server rejects', async () => {
    localStorage.setItem(TOKEN_KEY, 'expired.token');
    authApi.me.mockRejectedValue(new Error('Token expired'));

    renderProbe();

    expect(await screen.findByText('token: none')).toBeInTheDocument();
    expect(screen.getByText('user: none')).toBeInTheDocument();
  });

  it('stores the token and user returned by a successful login', async () => {
    authApi.me.mockResolvedValue({ user: { id: 1, name: 'Ada Lovelace' } });
    authApi.login.mockResolvedValue({
      token: 'fresh.token',
      user: { id: 1, name: 'Ada Lovelace' },
    });

    renderProbe();
    await userEvent.click(await screen.findByRole('button', { name: 'log in' }));

    expect(await screen.findByText('user: Ada Lovelace')).toBeInTheDocument();
    expect(localStorage.getItem(TOKEN_KEY)).toBe('fresh.token');
  });

  it('clears the session on logout', async () => {
    localStorage.setItem(TOKEN_KEY, 'stored.token');
    authApi.me.mockResolvedValue({ user: { id: 1, name: 'Ada Lovelace' } });
    authApi.logout.mockResolvedValue({ message: 'Logged out' });

    renderProbe();
    await userEvent.click(await screen.findByRole('button', { name: 'log out' }));

    await waitFor(() => expect(localStorage.getItem(TOKEN_KEY)).toBeNull());
    expect(screen.getByText('user: none')).toBeInTheDocument();
  });

  it('clears the session even when the logout call fails', async () => {
    // The token has to go regardless, or "log out" silently does nothing.
    localStorage.setItem(TOKEN_KEY, 'stored.token');
    authApi.me.mockResolvedValue({ user: { id: 1, name: 'Ada Lovelace' } });
    authApi.logout.mockRejectedValue(new Error('Network down'));

    renderProbe();
    await userEvent.click(await screen.findByRole('button', { name: 'log out' }));

    await waitFor(() => expect(localStorage.getItem(TOKEN_KEY)).toBeNull());
  });
});
