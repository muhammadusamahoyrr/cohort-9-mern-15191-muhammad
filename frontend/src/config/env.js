// keep import.meta.env in here only, so jest has one module to stub
export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

export const TOKEN_STORAGE_KEY = 'notes.token';
