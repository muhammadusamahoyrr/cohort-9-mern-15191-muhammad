import client from './client';

export function listNotes({ search = '', page = 1, limit = 10, sort, order } = {}) {
  return client.get('/notes', {
    params: {
      // skip the empty ones, otherwise they show up as ?search= in the logs
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

export function createNote({ title, contentHtml, isPinned = false }) {
  return client.post('/notes', { title, contentHtml, isPinned });
}

export function updateNote(id, changes) {
  return client.put(`/notes/${id}`, changes);
}

export function deleteNote(id) {
  return client.delete(`/notes/${id}`);
}
