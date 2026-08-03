import client from './client';

/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} name
 * @property {string} email
 */

/**
 * @typedef {Object} Session
 * @property {string} token  bearer token
 * @property {User}   user
 */

/**
 * Returns the unwrapped payload, not an AxiosResponse — see the response
 * interceptor in ./client.
 *
 * @param {{ name: string, email: string, password: string }} details
 * @returns {Promise<Session>}
 */
export function register({ name, email, password }) {
  return client.post('/auth/register', { name, email, password });
}

/**
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<Session>}
 */
export function login({ email, password }) {
  return client.post('/auth/login', { email, password });
}

// fire and forget. we drop the token either way, this just lets the backend
// log the event
/**
 * @returns {Promise<{ message: string }>}
 */
export function logout() {
  return client.post('/auth/logout');
}

/**
 * @returns {Promise<{ user: User }>}
 */
export function me() {
  return client.get('/auth/me');
}
