import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route } from 'react-router-dom';
import NoteEditor from '../../pages/NoteEditor';
import * as notesApi from '../../api/notes.api';
import { DEFAULT_NOTE_COLOR } from '../../components/notePalette';
import { renderWithRouter } from '../helpers/render';

jest.mock('../../api/notes.api');

jest.mock('react-quill-new', () => {
  const React = require('react');
  const MockQuill = ({ value, onChange, placeholder }) =>
    React.createElement('textarea', {
      'aria-label': 'Note body',
      placeholder,
      value,
      onChange: (e) => onChange(e.target.value, null, 'user'),
    });
  return { __esModule: true, default: MockQuill };
});

const dashboardRoute = <Route path="/" element={<h1>Your notes</h1>} />;

const renderEditor = (route = '/notes/new') =>
  renderWithRouter(<NoteEditor />, {
    route,
    path: route === '/notes/new' ? '/notes/new' : '/notes/:id',
    extraRoutes: dashboardRoute,
  });

beforeEach(() => {
  jest.clearAllMocks();
  notesApi.listNotes.mockResolvedValue({ notes: [], pagination: {} });
});

describe('NoteEditor: new note', () => {
  it('creates the note and returns to the dashboard', async () => {
    notesApi.createNote.mockResolvedValue({ note: { id: 7 } });

    renderEditor();

    await userEvent.type(screen.getByLabelText('Title'), 'Retro actions');
    await userEvent.type(screen.getByLabelText('Note body'), 'Ship the thing');
    await userEvent.click(screen.getByRole('button', { name: 'Save note' }));

    await waitFor(() =>
      expect(notesApi.createNote).toHaveBeenCalledWith({
        title: 'Retro actions',
        contentHtml: 'Ship the thing',
        isPinned: false,
        color: DEFAULT_NOTE_COLOR,
        type: 'note',
      })
    );
    expect(await screen.findByRole('heading', { name: 'Your notes' })).toBeInTheDocument();
  });

  it('validates that title is required before saving', async () => {
    renderEditor();

    await userEvent.type(screen.getByLabelText('Note body'), 'Body without a title');
    await userEvent.click(screen.getByRole('button', { name: 'Save note' }));

    expect(await screen.findByText('Give the note a title')).toBeInTheDocument();
    expect(notesApi.createNote).not.toHaveBeenCalled();
  });

  it('counts words across block elements', async () => {
    renderEditor();

    await userEvent.type(
      screen.getByLabelText('Note body'),
      '<ul><li>Coffee</li><li>Olive oil</li><li>Bread</li></ul>'
    );

    expect(await screen.findByText(/4 words/)).toBeInTheDocument();
  });

  it('leaves without saving when nothing has been typed', async () => {
    renderEditor();

    await userEvent.click(screen.getByRole('button', { name: 'Close note' }));

    expect(await screen.findByRole('heading', { name: 'Your notes' })).toBeInTheDocument();
    expect(notesApi.createNote).not.toHaveBeenCalled();
  });

  it('asks before discarding unsaved work', async () => {
    renderEditor();

    await userEvent.type(screen.getByLabelText('Title'), 'Half-written');
    await userEvent.click(screen.getByRole('button', { name: 'Close note' }));

    expect(await screen.findByRole('dialog')).toHaveTextContent('Discard changes?');

    await userEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
    expect(screen.getByLabelText('Title')).toHaveValue('Half-written');
  });
});

describe('NoteEditor: existing note', () => {
  const existing = {
    note: {
      id: 5,
      title: 'Standup notes',
      contentHtml: '<p>Discussed the release train</p>',
      isPinned: false,
      createdAt: '2026-07-01T09:00:00.000Z',
      updatedAt: '2026-07-02T09:00:00.000Z',
    },
  };

  it('loads the note into the editor', async () => {
    notesApi.getNote.mockResolvedValue(existing);

    renderEditor('/notes/5');

    expect(await screen.findByLabelText('Title')).toHaveValue('Standup notes');
    expect(screen.getByLabelText('Note body')).toHaveValue('<p>Discussed the release train</p>');
  });

  it('reports no unsaved changes until something is edited', async () => {
    notesApi.getNote.mockResolvedValue(existing);

    renderEditor('/notes/5');
    await screen.findByLabelText('Title');

    expect(screen.queryByText(/unsaved/)).not.toBeInTheDocument();
  });

  it('updates rather than creates, and keeps the note id', async () => {
    notesApi.getNote.mockResolvedValue(existing);
    notesApi.updateNote.mockResolvedValue(existing);

    renderEditor('/notes/5');

    const title = await screen.findByLabelText('Title');
    await userEvent.clear(title);
    await userEvent.type(title, 'Standup notes (edited)');
    await userEvent.click(screen.getByRole('button', { name: 'Save note' }));

    await waitFor(() =>
      expect(notesApi.updateNote).toHaveBeenCalledWith('5', {
        title: 'Standup notes (edited)',
        contentHtml: '<p>Discussed the release train</p>',
        isPinned: false,
        color: DEFAULT_NOTE_COLOR,
        type: 'note',
      })
    );
    expect(notesApi.createNote).not.toHaveBeenCalled();
  });

  it('renders not-found state when note does not exist', async () => {
    const notFound = new Error('Note not found');
    notFound.status = 404;
    notesApi.getNote.mockRejectedValue(notFound);

    renderEditor('/notes/5');

    expect(await screen.findByText('That note no longer exists.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Back to your notes' })).toBeInTheDocument();
  });
});
