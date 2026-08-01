import axios from 'axios';
import { API_URL, TOKEN_STORAGE_KEY } from '../config/env';

const client = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // storage disabled or full, nothing we can do
  }
}

client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// give every failure the same shape, whatever axios hands us
function normalizeError(error) {
  const status = error.response?.status ?? 0;
  const body = error.response?.data;

  let message;
  if (body?.error?.message) {
    message = body.error.message;
  } else if (error.code === 'ECONNABORTED') {
    message = 'The server took too long to respond. Please try again.';
  } else if (!error.response) {
    message = 'Cannot reach the server. Is the backend running?';
  } else {
    message = 'Something went wrong. Please try again.';
  }

  const err = new Error(message);
  err.status = status;
  err.code = body?.error?.code ?? null;
  err.details = body?.error?.details ?? null;
  err.requestId = body?.requestId ?? null;
  return err;
}

const AUTH_ROUTES = ['/auth/login', '/auth/register'];

client.interceptors.response.use(
  (response) => response.data?.data ?? response.data,
  (error) => {
    const url = error.config?.url ?? '';
    const loggingIn = AUTH_ROUTES.some((path) => url.startsWith(path));

    // An expired session bounces to /login, but a 401 from the login form
    // itself just means wrong password, so leave that one alone.
    if (error.response?.status === 401 && !loggingIn) {
      setToken(null);
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }

    return Promise.reject(normalizeError(error));
  }
);

export default client;

