import axios from 'axios';
import { API_URL, TOKEN_STORAGE_KEY } from '../config/env';

/**
 * The single seam between the app and the network. Components and hooks import
 * from api/*.api.js, never axios directly, so Jest only ever has to mock here.
 */
const client = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  // Quill pastes can produce large bodies; the backend accepts up to 4 MB.
  timeout: 15000,
});

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    // Safari private mode throws on localStorage access.
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
    /* nothing useful to do — the request interceptor will just send no token */
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
 * Normalises everything the API can throw into one Error shape so callers can
 * do `catch (err) { setError(err.message) }` without inspecting axios internals.
 */
function toAppError(error) {
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

  const appError = new Error(message);
  appError.status = status;
  appError.code = body?.error?.code ?? null;
  appError.details = body?.error?.details ?? null;
  appError.requestId = body?.requestId ?? null;
  return appError;
}

const AUTH_ENTRY_POINTS = ['/auth/login', '/auth/register'];

client.interceptors.response.use(
  // Every successful response is `{ success: true, data: ... }` — unwrap it once
  // here so callers deal in domain objects instead of envelopes.
  (response) => response.data?.data ?? response.data,
  (error) => {
    const url = error.config?.url ?? '';
    const isLoginAttempt = AUTH_ENTRY_POINTS.some((path) => url.startsWith(path));

    // A 401 on login just means "wrong password" — bouncing to /login there
    // would wipe the form and hide the message the user needs to read.
    if (error.response?.status === 401 && !isLoginAttempt) {
      setToken(null);
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }

    return Promise.reject(toAppError(error));
  }
);

export default client;
