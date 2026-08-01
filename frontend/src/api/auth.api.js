import client from './client';

export function register({ name, email, password }) {
  return client.post('/auth/register', { name, email, password });
}

export function login({ email, password }) {
  return client.post('/auth/login', { email, password });
}

// fire and forget. we drop the token either way, this just lets the backend
// log the event
export function logout() {
  return client.post('/auth/logout');
}

export function me() {
  return client.get('/auth/me');
}
