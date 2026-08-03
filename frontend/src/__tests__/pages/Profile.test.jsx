import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route } from 'react-router-dom';
import Profile from '../../pages/Profile';
import * as notesApi from '../../api/notes.api';
import * as authApi from '../../api/auth.api';
import { buildPagination, renderWithRouter } from '../helpers/render';

jest.mock('../../api/notes.api');
jest.mock('../../api/auth.api');

const TOKEN_KEY = 'notes.token';

const user = {
  id: 1,
  name: 'Ada Lovelace',
  email: 'ada@example.com',
  createdAt: '2026-02-11T09:00:00.000Z',
};

const renderProfile = () => {
  localStorage.setItem(TOKEN_KEY, 'stored.token');
  authApi.me.mockResolvedValue({ user });

  return renderWithRouter(<Profile />, {
    route: '/profile',
    path: '/profile',
    withAuth: true,
    extraRoutes: <Route path="/login" element={<h1>Welcome back</h1>} />,
  });
};

describe('Profile', () => {
  it('shows the signed-in user and how many notes they have', async () => {
    notesApi.listNotes.mockResolvedValue({
      notes: [],
      pagination: buildPagination({ total: 12 }),
    });

    renderProfile();

    expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('ada@example.com')).toBeInTheDocument();
    expect(await screen.findByText('12')).toBeInTheDocument();
    // we only ask for one row, the count comes from the pagination block
    expect(notesApi.listNotes).toHaveBeenCalledWith({ limit: 1 });
  });

  it('leaves a dash in place when the count cannot be fetched', async () => {
    notesApi.listNotes.mockRejectedValue(new Error('Cannot reach the server.'));

    renderProfile();

    expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
    // A missing count is not worth an error banner on this screen.
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('confirms, then logs out and returns to the login screen', async () => {
    notesApi.listNotes.mockResolvedValue({ notes: [], pagination: buildPagination() });
    authApi.logout.mockResolvedValue({ message: 'Logged out' });

    renderProfile();
    await userEvent.click(await screen.findByRole('button', { name: 'Log out' }));

    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveTextContent('Log out?');
    expect(authApi.logout).not.toHaveBeenCalled();

    await userEvent.click(
      screen.getAllByRole('button', { name: 'Log out' }).find((b) => dialog.contains(b))
    );

    await waitFor(() => expect(localStorage.getItem(TOKEN_KEY)).toBeNull());
    expect(await screen.findByRole('heading', { name: 'Welcome back' })).toBeInTheDocument();
  });

  it('stays put when the logout confirmation is dismissed', async () => {
    notesApi.listNotes.mockResolvedValue({ notes: [], pagination: buildPagination() });

    renderProfile();
    await userEvent.click(await screen.findByRole('button', { name: 'Log out' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(authApi.logout).not.toHaveBeenCalled();
    expect(localStorage.getItem(TOKEN_KEY)).toBe('stored.token');
  });
});
