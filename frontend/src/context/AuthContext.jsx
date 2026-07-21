import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import * as authApi from '../api/auth.api';
import { getToken, setToken } from '../api/client';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setTokenState] = useState(() => getToken());
  // Starts true so ProtectedRoute doesn't bounce a returning user to /login
  // during the split second before /auth/me answers.
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
      .catch(() => {
        // Expired or tampered token. The response interceptor has already
        // cleared storage; mirror that in state so the UI agrees.
        if (!cancelled) {
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
      // Server unreachable or token already expired — the local session still
      // has to go, otherwise "log out" silently does nothing.
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
