import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import * as authApi from '../api/auth.api';
import { getToken, setToken } from '../api/client';

/**
 * @typedef {Object} AuthValue
 * @property {import('../api/auth.api').User|null} user
 * @property {string|null} token
 * @property {boolean} loading  true while a stored token is being verified
 * @property {(credentials: { email: string, password: string }) => Promise<import('../api/auth.api').User>} login
 * @property {(details: { name: string, email: string, password: string }) => Promise<import('../api/auth.api').User>} register
 * @property {() => Promise<void>} logout
 */

/** @type {import('react').Context<AuthValue|null>} */
export const AuthContext = createContext(null);

/**
 * Holds the session. On mount it verifies any stored token against /auth/me.
 *
 * @param {{ children: import('react').ReactNode }} props
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(() => getToken());
  const [loading, setLoading] = useState(Boolean(getToken()));

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    authApi
      .me()
      .then(({ user: fetched }) => {
        if (!cancelled) setUser(fetched);
      })
      .catch((err) => {
        // Only a token the server actually rejected ends the session. A
        // timeout or a 5xx must not sign someone out mid-visit — they keep
        // their token and the next request can succeed.
        if (!cancelled && err.status === 401) {
          setToken(null);
          setTokenState(null);
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const applySession = useCallback((session) => {
    setToken(session.token);
    setTokenState(session.token);
    setUser(session.user);
    return session.user;
  }, []);

  // Errors propagate to the caller on purpose. Login.jsx and Register.jsx
  // catch them and put the message on the form.
  const login = useCallback(
    async (credentials) => applySession(await authApi.login(credentials)),
    [applySession]
  );

  const register = useCallback(
    async (details) => applySession(await authApi.register(details)),
    [applySession]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignored: best-effort server logout
    }
    setToken(null);
    setTokenState(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, token, loading, login, register, logout }),
    [user, token, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};


