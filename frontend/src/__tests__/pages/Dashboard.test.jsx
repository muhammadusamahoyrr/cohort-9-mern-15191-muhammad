import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from '../../pages/Dashboard';
import * as notesApi from '../../api/notes.api';
import { buildNote, buildPagination, renderWithRouter } from '../helpers/render';

jest.mock('../../api/notes.api');

const listOf = (notes, pagination = {}) => ({
  notes,
  pagination: buildPagination({ total: notes.length, ...pagination }),
});

const renderDashboard = () => renderWithRouter(<Dashboard />);

describe('Dashboard', () => {
  it('renders the notes the API returns', async () => {
    notesApi.listNotes.mockResolvedValue(
      listOf([
        buildNote({ id: 1, title: 'Standup notes' }),
        buildNote({ id: 2, title: 'Groceries', preview: 'Coffee, olive oil' }),
      ])
    );

    renderDashboard();

    expect(await screen.findByRole('link', { name: 'Standup notes' })).toBeInTheDocument();
    expect(screen.getByText('Coffee, olive oil')).toBeInTheDocument();
    expect(screen.getByText('2 notes')).toBeInTheDocument();
  });

  it('invites the user to write when they have no notes', async () => {
    notesApi.listNotes.mockResolvedValue(listOf([]));

    renderDashboard();

    expect(await screen.findByText('Nothing written yet')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Write your first note' })).toHaveAttribute(
      'href',
      '/notes/new'
    );
  });

  it('sends the typed term to the API and reports when nothing matches', async () => {
    notesApi.listNotes.mockResolvedValue(listOf([buildNote()]));
    renderDashboard();
    await screen.findByRole('link', { name: 'Standup notes' });

    notesApi.listNotes.mockResolvedValue(listOf([]));
    await userEvent.type(screen.getByLabelText('Search notes'), 'quarterly');

    await waitFor(() =>
      expect(notesApi.listNotes).toHaveBeenLastCalledWith(
        expect.objectContaining({ search: 'quarterly', page: 1 })
      )
    );
    expect(await screen.findByText('No matches')).toBeInTheDocument();
  });

  it('debounces typing into a single request', async () => {
    notesApi.listNotes.mockResolvedValue(listOf([buildNote()]));
    renderDashboard();
    await screen.findByRole('link', { name: 'Standup notes' });

    notesApi.listNotes.mockClear();
    await userEvent.type(screen.getByLabelText('Search notes'), 'standup');

    await waitFor(() =>
      expect(notesApi.listNotes).toHaveBeenCalledWith(
        expect.objectContaining({ search: 'standup' })
      )
    );
    // Seven keystrokes, one request.
    expect(notesApi.listNotes).toHaveBeenCalledTimes(1);
  });

  it('confirms before deleting, then removes the note', async () => {
    notesApi.listNotes.mockResolvedValue(listOf([buildNote({ title: 'Groceries' })]));
    notesApi.deleteNote.mockResolvedValue('');

    renderDashboard();
    await userEvent.click(await screen.findByRole('button', { name: 'Delete Groceries' }));

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText(/will be gone for good/)).toBeInTheDocument();
    expect(notesApi.deleteNote).not.toHaveBeenCalled();

    notesApi.listNotes.mockResolvedValue(listOf([]));
    await userEvent.click(within(dialog).getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(notesApi.deleteNote).toHaveBeenCalledWith(1));
    expect(await screen.findByText('Nothing written yet')).toBeInTheDocument();
  });

  it('keeps the note when the confirmation is dismissed', async () => {
    notesApi.listNotes.mockResolvedValue(listOf([buildNote({ title: 'Groceries' })]));

    renderDashboard();
    await userEvent.click(await screen.findByRole('button', { name: 'Delete Groceries' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(notesApi.deleteNote).not.toHaveBeenCalled();
    expect(screen.getByRole('link', { name: 'Groceries' })).toBeInTheDocument();
  });

  it('explains itself when the list cannot be loaded', async () => {
    notesApi.listNotes.mockRejectedValue(new Error('Cannot reach the server.'));

    renderDashboard();

    expect(await screen.findByRole('alert')).toHaveTextContent('Cannot reach the server.');
  });

  it('pages through results without re-running the search', async () => {
    notesApi.listNotes.mockResolvedValue(
      listOf([buildNote()], { total: 12, totalPages: 2, page: 1 })
    );

    renderDashboard();
    await userEvent.click(await screen.findByRole('button', { name: 'Next' }));

    await waitFor(() =>
      expect(notesApi.listNotes).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 }))
    );
  });
});
