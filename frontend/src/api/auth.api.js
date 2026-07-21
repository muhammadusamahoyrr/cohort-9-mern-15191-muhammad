import client from './client';

export function register({ name, email, password }) {
  return client.post('/auth/register', { name, email, password });
}

export function login({ email, password }) {
  return client.post('/auth/login', { email, password });
}

// Fire-and-forget: the token is discarded client-side regardless of the result,
// the call exists so the backend can log the event.
export function logout() {
  return client.post('/auth/logout');
}

export function me() {
  return client.get('/auth/me');
}
