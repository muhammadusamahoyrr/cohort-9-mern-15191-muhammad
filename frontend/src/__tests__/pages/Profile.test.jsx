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
  name: 'Sara Khan',
  email: 'sara@example.com',
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

    expect(await screen.findByText('Sara Khan')).toBeInTheDocument();
    expect(screen.getByText('sara@example.com')).toBeInTheDocument();
    expect(await screen.findByText('12')).toBeInTheDocument();
    expect(notesApi.listNotes).toHaveBeenCalledWith({ limit: 1 });
  });

  it('leaves a dash in place when the count cannot be fetched', async () => {
    notesApi.listNotes.mockRejectedValue(new Error('Cannot reach the server.'));

    renderProfile();

    expect(await screen.findByText('Sara Khan')).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
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

  it('remains on profile when logout is cancelled', async () => {
    notesApi.listNotes.mockResolvedValue({ notes: [], pagination: buildPagination() });

    renderProfile();
    await userEvent.click(await screen.findByRole('button', { name: 'Log out' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(authApi.logout).not.toHaveBeenCalled();
    expect(localStorage.getItem(TOKEN_KEY)).toBe('stored.token');
  });

  it('triggers notes export and downloads JSON backup', async () => {
    notesApi.listNotes.mockResolvedValue({ notes: [], pagination: buildPagination({ total: 3 }) });
    notesApi.exportNotes.mockResolvedValue({
      count: 3,
      notes: [{ id: 1, title: 'Note 1' }],
    });

    window.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    window.URL.revokeObjectURL = jest.fn();

    renderProfile();

    const exportBtn = await screen.findByRole('button', { name: 'Export Notes (JSON)' });
    await userEvent.click(exportBtn);

    expect(notesApi.exportNotes).toHaveBeenCalled();
    expect(await screen.findByText(/Exported 3 note\(s\) successfully/i)).toBeInTheDocument();
  });
});
