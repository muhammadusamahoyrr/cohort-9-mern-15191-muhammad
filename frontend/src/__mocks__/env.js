// Stand-in for src/config/env.js under Jest. Fixed value so tests don't depend
// on whatever happens to be in the developer's .env file.
export const API_URL = 'http://localhost:4000/api';
export const TOKEN_STORAGE_KEY = 'notes.token';
