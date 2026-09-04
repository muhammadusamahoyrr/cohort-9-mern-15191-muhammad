import client from './client';

export function listNotes({ search = '', page = 1, limit = 10, sort, order } = {}) {
  return client.get('/notes', {
    params: {
      ...(search ? { search } : {}),
      ...(sort ? { sort } : {}),
      ...(order ? { order } : {}),
      page,
      limit,
    },
  });
}

export function getNote(id) {
  return client.get(`/notes/${id}`);
}

export function createNote({ title, contentHtml, isPinned = false, ...rest }) {
  return client.post('/notes', { title, contentHtml, isPinned, ...rest });
}

export function updateNote(id, changes) {
  return client.put(`/notes/${id}`, changes);
}

export function deleteNote(id) {
  return client.delete(`/notes/${id}`);
}

export function exportNotes() {
  return client.get('/notes/export');
}

export function importNotes(notes) {
  return client.post('/notes/import', { notes });
}

