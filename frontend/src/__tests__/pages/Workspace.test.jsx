import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Workspace from '../../pages/Workspace';
import * as notesApi from '../../api/notes.api';
import { buildNote, buildPagination, renderWithRouter } from '../helpers/render';

jest.mock('../../api/notes.api');

const listOf = (notes, pagination = {}) => ({
  notes,
  pagination: buildPagination({ total: notes.length, ...pagination }),
});

const renderWorkspace = (route = '/') => renderWithRouter(<Workspace />, { route });

// Search is its own page now, so searching means rendering that route.
const renderSearch = () => {
  renderWorkspace('/search');
  return screen.getByRole('searchbox');
};

describe('Workspace', () => {
  it('lists the notes the API returns', async () => {
    notesApi.listNotes.mockResolvedValue(
      listOf([
        buildNote({ id: 1, title: 'Standup notes' }),
        buildNote({ id: 2, title: 'Groceries', preview: 'Coffee, olive oil' }),
      ])
    );

    renderWorkspace();

    expect(await screen.findByRole('link', { name: /Standup notes/ })).toBeInTheDocument();
    expect(screen.getByText('Coffee, olive oil')).toBeInTheDocument();
  });

  it('links each card at its own note', async () => {
    notesApi.listNotes.mockResolvedValue(listOf([buildNote({ id: 7, title: 'Groceries' })]));

    renderWorkspace();

    expect(await screen.findByRole('link', { name: /Groceries/ })).toHaveAttribute(
      'href',
      '/notes/7'
    );
  });

  it('says so when there is nothing to show', async () => {
    notesApi.listNotes.mockResolvedValue(listOf([]));

    renderWorkspace();

    expect(await screen.findByText('No notes yet')).toBeInTheDocument();
  });

  it('sends the typed term to the API and reports when nothing matches', async () => {
    notesApi.listNotes.mockResolvedValue(listOf([buildNote()]));
    const field = renderSearch();

    notesApi.listNotes.mockResolvedValue(listOf([]));
    await userEvent.type(field, 'quarterly');

    await waitFor(() =>
      expect(notesApi.listNotes).toHaveBeenLastCalledWith(
        expect.objectContaining({ search: 'quarterly', page: 1 })
      )
    );
    expect(await screen.findByText(/No notes match/)).toBeInTheDocument();
  });

  it('debounces typing into a single request', async () => {
    notesApi.listNotes.mockResolvedValue(listOf([buildNote()]));
    const field = renderSearch();
    await screen.findByRole('link', { name: /Standup notes/ });

    notesApi.listNotes.mockClear();
    await userEvent.type(field, 'standup');

    await waitFor(() =>
      expect(notesApi.listNotes).toHaveBeenCalledWith(expect.objectContaining({ search: 'standup' }))
    );
    // Seven keystrokes, one request.
    expect(notesApi.listNotes).toHaveBeenCalledTimes(1);
  });

  it('offers search options and recent notes until something is typed', async () => {
    notesApi.listNotes.mockResolvedValue(listOf([buildNote()]));
    renderSearch();

    expect(screen.getByRole('heading', { name: 'Search Options' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Recent notes' })).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: /Standup notes/ })).toBeInTheDocument();
  });

  it('reorders the list from the options menu', async () => {
    notesApi.listNotes.mockResolvedValue(
      listOf([
        buildNote({ id: 1, title: 'Zebra', updatedAt: '2026-07-20T10:00:00.000Z' }),
        buildNote({ id: 2, title: 'Apple', updatedAt: '2026-07-21T10:00:00.000Z' }),
      ])
    );

    renderWorkspace();
    await screen.findByRole('link', { name: /Apple/ });

    // The sort row is a cycle showing the active mode, so reaching "Title"
    // means stepping through it rather than picking from a list.
    await userEvent.click(screen.getByRole('button', { name: 'List options' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Date Modified' }));

    await userEvent.click(screen.getByRole('button', { name: 'List options' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Date Created' }));

    // scope to the card list, otherwise the rail's own links come first
    await waitFor(() => {
      const titles = within(screen.getByRole('list'))
        .getAllByRole('link')
        .map((el) => el.textContent);
      expect(titles[0]).toMatch(/Apple/);
      expect(titles[1]).toMatch(/Zebra/);
    });
  });

  it('switches note-card density from the options menu', async () => {
    notesApi.listNotes.mockResolvedValue(listOf([buildNote()]));

    renderWorkspace();
    await screen.findByRole('link', { name: /Standup notes/ });

    expect(screen.getByRole('list')).toHaveClass('notecards--medium');

    await userEvent.click(screen.getByRole('button', { name: 'List options' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Small' }));

    expect(screen.getByRole('list')).toHaveClass('notecards--small');
  });

  it('narrows the list to pinned notes', async () => {
    notesApi.listNotes.mockResolvedValue(
      listOf([
        buildNote({ id: 1, title: 'Standup notes', isPinned: true }),
        buildNote({ id: 2, title: 'Groceries', isPinned: false }),
      ])
    );

    renderWorkspace();
    await screen.findByRole('link', { name: /Groceries/ });

    await userEvent.click(screen.getByRole('button', { name: 'Show pinned notes only' }));

    expect(screen.getByRole('heading', { name: 'Pinned' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Groceries/ })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Standup notes/ })).toBeInTheDocument();
  });

  it('confirms before deleting, then drops the note', async () => {
    notesApi.listNotes.mockResolvedValue(listOf([buildNote({ id: 1, title: 'Groceries' })]));
    notesApi.deleteNote.mockResolvedValue('');

    renderWorkspace();
    await userEvent.click(await screen.findByRole('button', { name: /Actions for Groceries/ }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Delete' }));

    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText(/will be gone for good/)).toBeInTheDocument();
    expect(notesApi.deleteNote).not.toHaveBeenCalled();

    notesApi.listNotes.mockResolvedValue(listOf([]));
    await userEvent.click(within(dialog).getByRole('button', { name: 'Delete' }));

    await waitFor(() => expect(notesApi.deleteNote).toHaveBeenCalledWith(1));
  });

  it('keeps the note when the confirmation is dismissed', async () => {
    notesApi.listNotes.mockResolvedValue(listOf([buildNote({ id: 1, title: 'Groceries' })]));

    renderWorkspace();
    await userEvent.click(await screen.findByRole('button', { name: /Actions for Groceries/ }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Delete' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(notesApi.deleteNote).not.toHaveBeenCalled();
    expect(screen.getByRole('link', { name: /Groceries/ })).toBeInTheDocument();
  });

  it('pins a note from its card menu', async () => {
    notesApi.listNotes.mockResolvedValue(
      listOf([buildNote({ id: 3, title: 'Groceries', isPinned: false })])
    );
    notesApi.updateNote.mockResolvedValue({ note: {} });

    renderWorkspace();
    await userEvent.click(await screen.findByRole('button', { name: /Actions for Groceries/ }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Pin' }));

    await waitFor(() => expect(notesApi.updateNote).toHaveBeenCalledWith(3, { isPinned: true }));
  });

  it('explains itself when the list cannot be loaded', async () => {
    notesApi.listNotes.mockRejectedValue(new Error('Cannot reach the server.'));

    renderWorkspace();

    expect(await screen.findByRole('alert')).toHaveTextContent('Cannot reach the server.');
  });
});
