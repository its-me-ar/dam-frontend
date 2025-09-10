import {
  createContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from 'react';
import { jwtDecode } from 'jwt-decode';
import { setAuthToken } from '../lib/api';

export type Role = 'ADMIN' | 'USER' | 'MANAGER';

type AuthContextValue = {
  token: string | null;
  isAuthenticated: boolean;
  role: Role | null;
  userId: string | null;
  login: (token: string) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('auth_token')
  );
  const [role, setRole] = useState<Role | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Function to check if token is expired
  const isTokenExpired = (token: string): boolean => {
    try {
      const payload = jwtDecode<{ exp: number }>(token);
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  };

  // Function to logout user
  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem('auth_token');
    setRole(null);
    setUserId(null);
  }, []);

  useEffect(() => {
    setAuthToken(token);
    if (token) {
      // Check if token is expired first
      if (isTokenExpired(token)) {
        logout();
        return;
      }

      try {
        const payload = jwtDecode<{
          userId: string;
          role: string;
          iat: number;
          exp: number;
        }>(token);

        // Token is valid, proceed with normal flow
        localStorage.setItem('auth_token', token);
        const r: string = payload.role;
        if (r === 'ADMIN' || r === 'USER' || r === 'MANAGER') {
          setRole(r);
        } else {
          setRole(null);
        }
        setUserId(payload.userId);
      } catch {
        // Invalid token, logout and remove token
        logout();
      }
    } else {
      localStorage.removeItem('auth_token');
      setRole(null);
      setUserId(null);
    }
  }, [token]);

  // Periodic check for token expiry (every minute)
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      if (token && isTokenExpired(token)) {
        logout();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      role,
      userId,
      login: (newToken: string) => setToken(newToken),
      logout,
    }),
    [token, role, userId, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
