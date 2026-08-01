import client from './client';

/**
 * @typedef {Object} Note
 * @property {number} id
 * @property {string} title
 * @property {string} preview
 * @property {string} contentHtml
 * @property {boolean} isPinned
 * @property {string} createdAt  ISO 8601 date string
 * @property {string} updatedAt  ISO 8601 date string
 */

/**
 * @typedef {Object} ListParams
 * @property {string}  [search]
 * @property {number}  [page]
 * @property {number}  [limit]
 * @property {string}  [sort]   field name to sort by
 * @property {string}  [order]  'asc' | 'desc'
 */

/**
 * @param {ListParams} [params]
 * @returns {Promise<import('axios').AxiosResponse<{ data: Note[], total: number }>>}
 */
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

/**
 * @param {number} id
 * @returns {Promise<import('axios').AxiosResponse<Note>>}
 */
export function getNote(id) {
  return client.get(`/notes/${id}`);
}

/**
 * @param {{ title: string, contentHtml: string, isPinned?: boolean }} note
 * @returns {Promise<import('axios').AxiosResponse<Note>>}
 */
export function createNote({ title, contentHtml, isPinned = false }) {
  return client.post('/notes', { title, contentHtml, isPinned });
}

/**
 * @param {number} id
 * @param {Partial<Pick<Note, 'title' | 'contentHtml' | 'isPinned'>>} changes
 * @returns {Promise<import('axios').AxiosResponse<Note>>}
 */
export function updateNote(id, changes) {
  return client.put(`/notes/${id}`, changes);
}

/**
 * @param {number} id
 * @returns {Promise<import('axios').AxiosResponse<void>>}
 */
export function deleteNote(id) {
  return client.delete(`/notes/${id}`);
}
