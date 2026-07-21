import axios from 'axios';

// The instance the module under test builds, captured so its interceptors can
// be pulled out and exercised directly — that is where all the logic lives.
jest.mock('axios', () => {
  const instance = {
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  };
  return { __esModule: true, default: { create: jest.fn(() => instance) } };
});

let client;
let getToken;
let setToken;
let onRequest;
let onSuccess;
let onError;
let createConfig;

beforeAll(async () => {
  const mod = await import('../../api/client');
  client = mod.default;
  getToken = mod.getToken;
  setToken = mod.setToken;

  // Read everything the module did at import time now — the global
  // resetAllMocks in setupTests wipes these call records after the first test.
  [[createConfig]] = axios.create.mock.calls;
  [[onRequest]] = client.interceptors.request.use.mock.calls;
  [[onSuccess, onError]] = client.interceptors.response.use.mock.calls;
});

beforeEach(() => {
  localStorage.clear();
  Object.defineProperty(window, 'location', {
    writable: true,
    value: { pathname: '/', assign: jest.fn() },
  });
});

const axiosError = (status, data, config = { url: '/notes' }) => ({
  config,
  response: status ? { status, data } : undefined,
});

describe('token storage', () => {
  it('round-trips a token through localStorage', () => {
    setToken('abc.123');
    expect(getToken()).toBe('abc.123');
  });

  it('clears the token when passed a falsy value', () => {
    setToken('abc.123');
    setToken(null);
    expect(getToken()).toBeNull();
  });
});

describe('request interceptor', () => {
  it('attaches the stored token as a bearer header', () => {
    setToken('abc.123');
    const config = onRequest({ headers: {} });
    expect(config.headers.Authorization).toBe('Bearer abc.123');
  });

  it('sends no Authorization header when there is no token', () => {
    const config = onRequest({ headers: {} });
    expect(config.headers.Authorization).toBeUndefined();
  });
});

describe('response interceptor', () => {
  it('unwraps the success envelope so callers get the payload', () => {
    expect(onSuccess({ data: { success: true, data: { note: { id: 4 } } } })).toEqual({
      note: { id: 4 },
    });
  });

  it('passes bodies without an envelope through untouched', () => {
    expect(onSuccess({ data: '' })).toBe('');
  });

  it('rejects with the message the server sent', async () => {
    const error = axiosError(404, {
      success: false,
      error: { message: 'Note not found', code: 'NOT_FOUND', details: null },
      requestId: 'req-8f2a',
    });

    await expect(onError(error)).rejects.toMatchObject({
      message: 'Note not found',
      status: 404,
      code: 'NOT_FOUND',
      requestId: 'req-8f2a',
    });
  });

  it('explains an unreachable server instead of surfacing an axios message', async () => {
    await expect(onError({ config: { url: '/notes' } })).rejects.toThrow(/Cannot reach the server/);
  });

  it('clears the session and redirects when a protected call returns 401', async () => {
    setToken('abc.123');
    await expect(onError(axiosError(401, null))).rejects.toBeInstanceOf(Error);

    expect(getToken()).toBeNull();
    expect(window.location.assign).toHaveBeenCalledWith('/login');
  });

  it('leaves the login screen alone when the credentials are wrong', async () => {
    // A 401 here means "wrong password" — redirecting would wipe the form and
    // hide the message the user needs to read.
    const error = axiosError(
      401,
      { success: false, error: { message: 'Invalid credentials' } },
      { url: '/auth/login' }
    );

    await expect(onError(error)).rejects.toThrow('Invalid credentials');
    expect(window.location.assign).not.toHaveBeenCalled();
  });
});

it('is created against the configured API URL', () => {
  expect(createConfig).toMatchObject({ baseURL: 'http://localhost:4000/api' });
});
