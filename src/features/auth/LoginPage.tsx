import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth, type SessionUser } from '@/lib/auth';

const USUARIO_DEMO: SessionUser = { nombre: 'Ana Rodríguez', rol: 'Cajera · Turno mañana', iniciales: 'AR' };

/** Saludo según la hora, para darle calidez al inicio de sesión. */
function saludo(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 19) return 'Buenas tardes';
  return 'Buenas noches';
}

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const destino = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/';

  const [usuario, setUsuario] = useState('ana@gopic.gt');
  const [clave, setClave] = useState('');
  const [verClave, setVerClave] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  // Si ya hay sesión activa, no mostramos el login.
  if (user) return <Navigate to={destino} replace />;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!usuario.trim() || !clave.trim()) {
      setError('Ingresa tu usuario y contraseña.');
      return;
    }

    setCargando(true);
    // Simulamos la llamada al backend; en la demo cualquier credencial es válida.
    setTimeout(() => {
      login(USUARIO_DEMO);
      navigate(destino, { replace: true });
    }, 600);
  }

  return (
    <div className="grid h-full place-items-center bg-surface-sunk p-6">
      <div className="flex w-full max-w-3xl flex-col items-center gap-10 lg:flex-row lg:justify-center lg:gap-16">
        {/* Lado del logo */}
        <aside className="hidden items-center lg:flex">
          <img
            src="/img/logo.png"
            alt="GOPIC · Preparaciones con sabor"
            className="h-64 w-64 rounded-full object-cover"
          />
        </aside>

        {/* Lado del formulario */}
        <main className="w-full max-w-sm">
          {/* Logo compacto para móvil */}
          <div className="mb-6 flex justify-center lg:hidden">
            <img src="/img/logo.png" alt="GOPIC" className="h-24 w-24 rounded-full object-cover" />
          </div>

          <div className="mb-8 text-center">
            <h1 className="font-display text-2xl font-semibold text-text">{saludo()}</h1>
            <p className="mt-1 text-sm text-text-muted">Nos alegra tenerte de vuelta. Inicia sesión para continuar.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="usuario" className="mb-1 block text-sm font-medium text-text">
                Usuario
              </label>
              <input
                id="usuario"
                type="text"
                autoComplete="username"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="tu@correo.com"
                className="h-11 w-full rounded-md border border-border bg-surface-alt px-3 text-base text-text placeholder:text-text-muted focus:border-action-500 focus:outline-none"
              />
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <label htmlFor="clave" className="block text-sm font-medium text-text">
                  Contraseña
                </label>
                <button type="button" className="text-xs font-medium text-action-600 hover:underline">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative">
                <input
                  id="clave"
                  type={verClave ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={clave}
                  onChange={(e) => setClave(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 w-full rounded-md border border-border bg-surface-alt px-3 pr-11 text-base text-text placeholder:text-text-muted focus:border-action-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setVerClave((v) => !v)}
                  aria-label={verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-text-muted hover:bg-surface-sunk hover:text-text"
                >
                  {verClave ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-md bg-danger/10 px-3 py-2 text-sm font-medium text-danger">{error}</p>
            )}

            <Button type="submit" size="lg" className="w-full" loading={cargando}>
              <LogIn size={18} /> Ingresar
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-text-muted">GOPIC · Preparaciones con sabor</p>
        </main>
      </div>
    </div>
  );
}
