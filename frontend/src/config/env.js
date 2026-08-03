// keep import.meta.env in here only, so jest has one module to stub

/**
 * Base URL every API call is made against.
 * @type {string}
 */
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

/**
 * localStorage key holding the bearer token.
 * @type {string}
 */
export const TOKEN_STORAGE_KEY = 'notes.token';
