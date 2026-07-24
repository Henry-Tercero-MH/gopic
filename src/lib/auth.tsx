/**
 * Autenticación de la demo.
 * Sesión persistida en localStorage; sin backend todavía.
 * Cuando exista la API real, `login` llamará al endpoint y guardará el token.
 */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export interface SessionUser {
  nombre: string;
  rol: string;
  iniciales: string;
}

interface AuthContextValue {
  user: SessionUser | null;
  login: (user: SessionUser) => void;
  logout: () => void;
}

const STORAGE_KEY = 'gopic.session';

function leerSesion(): SessionUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(leerSesion);

  const login = useCallback((u: SessionUser) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>.');
  return ctx;
}

/** Protege las rutas privadas; redirige a /login conservando el destino. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <>{children}</>;
}
