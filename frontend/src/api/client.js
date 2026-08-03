import axios from 'axios';
import { API_URL, TOKEN_STORAGE_KEY } from '../config/env';

const client = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

/**
 * Reads the bearer token. Returns null when storage is unavailable, which is
 * the case in private-mode Safari and when cookies are blocked outright.
 *
 * @returns {string|null}
 */
export function getToken() {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Stores the bearer token, or clears it when passed a falsy value.
 *
 * @param {string|null} token
 * @returns {void}
 */
export function setToken(token) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // Ignore storage errors
  }
}

client.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Turns an axios failure into a plain Error carrying the fields the UI needs.
 * Callers see this shape, never a raw AxiosError.
 *
 * @param {import('axios').AxiosError} error
 * @returns {Error & { status: number, code: string|null, details: unknown, requestId: string|null }}
 */
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

const AUTH_ROUTES = ['/auth/login', '/auth/register', '/auth/me'];

/**
 * Every request resolves to the unwrapped payload, not an AxiosResponse: the
 * backend nests real data under `data`, so `{ data: { notes: [...] } }` reaches
 * callers as `{ notes: [...] }`. Responses without that envelope pass through
 * as-is. Failures reject with the normalized Error above. API modules type
 * their returns against this contract.
 */
client.interceptors.response.use(
  (response) => response.data?.data ?? response.data,
  (error) => {
    const url = error.config?.url ?? '';
    const loggingIn = AUTH_ROUTES.some((path) => url.startsWith(path));

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


