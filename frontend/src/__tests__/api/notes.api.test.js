import client from '../../api/client';
import * as notesApi from '../../api/notes.api';

jest.mock('../../api/client', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() },
}));

describe('notes API', () => {
  it('sends the default page and limit when nothing is specified', () => {
    notesApi.listNotes();

    expect(client.get).toHaveBeenCalledWith('/notes', { params: { page: 1, limit: 10 } });
  });

  it('omits empty query parameters rather than sending blanks', () => {
    // `?search=` in the URL is noise in the server logs and means nothing.
    notesApi.listNotes({ search: '', page: 2, limit: 9 });

    expect(client.get).toHaveBeenCalledWith('/notes', { params: { page: 2, limit: 9 } });
  });

  it('passes search, sort and order through when given', () => {
    notesApi.listNotes({ search: 'standup', sort: 'title', order: 'asc' });

    expect(client.get).toHaveBeenCalledWith('/notes', {
      params: { search: 'standup', sort: 'title', order: 'asc', page: 1, limit: 10 },
    });
  });

  it('reads a single note by id', () => {
    notesApi.getNote(12);
    expect(client.get).toHaveBeenCalledWith('/notes/12');
  });

  it('defaults a new note to unpinned', () => {
    notesApi.createNote({ title: 'Retro', contentHtml: '<p>Ship it</p>' });

    expect(client.post).toHaveBeenCalledWith('/notes', {
      title: 'Retro',
      contentHtml: '<p>Ship it</p>',
      isPinned: false,
    });
  });

  it('sends only the fields being changed on update', () => {
    notesApi.updateNote(12, { isPinned: true });
    expect(client.put).toHaveBeenCalledWith('/notes/12', { isPinned: true });
  });

  it('deletes by id', () => {
    notesApi.deleteNote(12);
    expect(client.delete).toHaveBeenCalledWith('/notes/12');
  });
});
