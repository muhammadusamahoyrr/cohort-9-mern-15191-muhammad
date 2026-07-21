// The only module in the app allowed to read import.meta.env — see docs/05-TESTING.md.
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

export const TOKEN_STORAGE_KEY = 'notes.token';
