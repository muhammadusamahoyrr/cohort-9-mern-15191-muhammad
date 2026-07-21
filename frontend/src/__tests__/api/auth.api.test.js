import client from '../../api/client';
import * as authApi from '../../api/auth.api';

jest.mock('../../api/client', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
}));

describe('auth API', () => {
  it('registers with exactly the three fields the endpoint accepts', () => {
    authApi.register({
      name: 'Ada',
      email: 'ada@example.com',
      password: 'Passw0rd',
      role: 'admin', // must not be forwarded
    });

    expect(client.post).toHaveBeenCalledWith('/auth/register', {
      name: 'Ada',
      email: 'ada@example.com',
      password: 'Passw0rd',
    });
  });

  it('logs in with credentials only', () => {
    authApi.login({ email: 'ada@example.com', password: 'Passw0rd' });

    expect(client.post).toHaveBeenCalledWith('/auth/login', {
      email: 'ada@example.com',
      password: 'Passw0rd',
    });
  });

  it('posts a logout with no body', () => {
    authApi.logout();
    expect(client.post).toHaveBeenCalledWith('/auth/logout');
  });

  it('reads the current user', () => {
    authApi.me();
    expect(client.get).toHaveBeenCalledWith('/auth/me');
  });
});
