/**
 * Autenticación de la demo.
 * Sesión persistida en localStorage; sin backend todavía.
 * Cuando exista la API real, `login` llamará al endpoint y guardará el token.
 */
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { setToken } from './api';

/** Perfil de permisos. `admin` ve todo; `colaborador` no ve costos/utilidad ni ajustes sensibles. */
export type Perfil = 'admin' | 'colaborador';

export interface SessionUser {
  nombre: string;
  rol: string;
  iniciales: string;
  perfil: Perfil;
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
    setToken(null); // limpia también el JWT del backend
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

/** true si la sesión actual es de un administrador. */
export function useEsAdmin(): boolean {
  return useAuth().user?.perfil === 'admin';
}

/**
 * Muestra `children` solo a administradores. Para colaboradores renderiza `fallback`
 * (por defecto nada). Útil para ocultar costos, utilidad y ajustes sensibles.
 */
export function SoloAdmin({ children, fallback = null }: { children: ReactNode; fallback?: ReactNode }) {
  return <>{useEsAdmin() ? children : fallback}</>;
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

/**
 * Protege rutas solo-admin. Un colaborador que llegue por URL directa se
 * redirige al Dashboard. (UX/organización, no seguridad: en producción el
 * backend es quien debe negar el acceso a los datos.)
 */
export function RequireAdmin({ children }: { children: ReactNode }) {
  return useEsAdmin() ? <>{children}</> : <Navigate to="/" replace />;
}
