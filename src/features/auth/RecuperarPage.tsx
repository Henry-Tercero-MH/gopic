import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, MailCheck, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { RUTAS } from '@/lib/rutas';

/**
 * Restablecer contraseña (prototipo mock).
 * Sin backend, solo simula el envío del enlace de recuperación al correo.
 */
export function RecuperarPage() {
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [cargando, setCargando] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setCargando(true);
    // Demo: simulamos el envío del correo de recuperación.
    setTimeout(() => {
      setCargando(false);
      setEnviado(true);
    }, 600);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-sunk px-4 py-6">
      <main className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <img src="/img/logo.png" alt="GOPIC" className="h-20 w-20 rounded-full object-cover" />
        </div>

        {enviado ? (
          <div className="rounded-xl border border-border bg-surface p-6 text-center shadow-card">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-success/15 text-success">
              <MailCheck size={28} />
            </span>
            <h1 className="mt-4 font-display text-xl font-semibold text-text">Revisa tu correo</h1>
            <p className="mt-1 text-sm text-text-muted">
              Si <span className="font-medium text-text">{email}</span> tiene una cuenta, te enviamos un enlace para
              restablecer tu contraseña.
            </p>
            <Link
              to={RUTAS.login}
              className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-md bg-action-500 px-6 text-lg font-medium text-on-action transition-colors hover:bg-action-600"
            >
              Volver a iniciar sesión
            </Link>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-surface p-6 shadow-card">
            <h1 className="font-display text-xl font-semibold text-text">Restablecer contraseña</h1>
            <p className="mt-1 text-sm text-text-muted">
              Ingresa tu correo y te enviaremos un enlace para crear una nueva contraseña.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label htmlFor="rec-email" className="mb-1 block text-sm font-medium text-text">
                  Correo
                </label>
                <input
                  id="rec-email"
                  type="email"
                  autoComplete="email"
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="h-11 w-full rounded-md border border-border bg-surface-alt px-3 text-base text-text placeholder:text-text-muted focus:border-action-500 focus:outline-none focus:ring-2 focus:ring-action-500/40"
                />
              </div>

              <Button type="submit" size="lg" className="w-full" loading={cargando} disabled={!email.trim()}>
                <Send size={18} /> Enviar enlace
              </Button>
            </form>
          </div>
        )}

        <Link
          to={RUTAS.login}
          className="mt-6 flex items-center justify-center gap-1.5 text-sm font-medium text-text-muted hover:text-text"
        >
          <ArrowLeft size={16} /> Volver a iniciar sesión
        </Link>
      </main>
    </div>
  );
}
