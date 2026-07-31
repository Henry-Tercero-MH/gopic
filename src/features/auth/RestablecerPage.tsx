import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Check, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { RUTAS } from '@/lib/rutas';
import { restablecerPassword } from '@/lib/api';

/** Fija una nueva contraseña a partir del token recibido por WhatsApp. */
export function RestablecerPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listo, setListo] = useState(false);

  const valido = password.length >= 6 && password === confirmar;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!valido || !token) return;
    setCargando(true);
    setError(null);
    try {
      await restablecerPassword(token, password);
      setListo(true);
      setTimeout(() => navigate(RUTAS.login), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo restablecer la contraseña.');
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-sunk px-4 py-6">
      <main className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <img src="/img/logo.png" alt="GOPIC" className="h-20 w-20 rounded-full object-cover" />
        </div>

        {!token ? (
          <div className="rounded-xl border border-border bg-surface p-6 text-center shadow-card">
            <h1 className="font-display text-xl font-semibold text-text">Enlace inválido</h1>
            <p className="mt-1 text-sm text-text-muted">Falta el token de restablecimiento. Solicita uno nuevo.</p>
            <Link to={RUTAS.recuperar} className="mt-5 inline-flex items-center justify-center gap-1.5 text-sm font-medium text-action-700 hover:underline">
              Solicitar enlace
            </Link>
          </div>
        ) : listo ? (
          <div className="rounded-xl border border-border bg-surface p-6 text-center shadow-card">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-success/15 text-success">
              <Check size={28} />
            </span>
            <h1 className="mt-4 font-display text-xl font-semibold text-text">Contraseña actualizada</h1>
            <p className="mt-1 text-sm text-text-muted">Ya puedes iniciar sesión con tu nueva contraseña.</p>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-surface p-6 shadow-card">
            <span className="grid h-11 w-11 place-items-center rounded-md bg-action-50 text-action-700">
              <KeyRound size={22} />
            </span>
            <h1 className="mt-3 font-display text-xl font-semibold text-text">Nueva contraseña</h1>
            <p className="mt-1 text-sm text-text-muted">Elige una contraseña de al menos 6 caracteres.</p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label htmlFor="pw" className="mb-1 block text-sm font-medium text-text">Nueva contraseña</label>
                <input
                  id="pw"
                  type="password"
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 w-full rounded-md border border-border bg-surface-alt px-3 text-base text-text focus:border-action-500 focus:outline-none focus:ring-2 focus:ring-action-500/40"
                />
              </div>
              <div>
                <label htmlFor="pw2" className="mb-1 block text-sm font-medium text-text">Confirmar contraseña</label>
                <input
                  id="pw2"
                  type="password"
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                  className="h-11 w-full rounded-md border border-border bg-surface-alt px-3 text-base text-text focus:border-action-500 focus:outline-none focus:ring-2 focus:ring-action-500/40"
                />
                {confirmar !== '' && password !== confirmar && (
                  <p className="mt-1 text-xs text-danger">Las contraseñas no coinciden.</p>
                )}
              </div>

              {error && <p className="text-sm text-danger">{error}</p>}

              <Button type="submit" size="lg" className="w-full" loading={cargando} disabled={!valido}>
                <Check size={18} /> Guardar contraseña
              </Button>
            </form>

            <Link to={RUTAS.login} className="mt-6 flex items-center justify-center gap-1.5 text-sm font-medium text-text-muted hover:text-text">
              <ArrowLeft size={16} /> Volver a iniciar sesión
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
