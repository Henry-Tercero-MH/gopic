import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Send, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { RUTAS } from '@/lib/rutas';
import { recuperarPassword, type RecuperarResultado } from '@/lib/api';

/**
 * Recuperación de contraseña vía WhatsApp.
 * El usuario escribe su correo; si tiene teléfono registrado, el backend genera
 * un enlace de restablecimiento y arma el mensaje de WhatsApp (wa.me) hacia su número.
 */
export function RecuperarPage() {
  const [email, setEmail] = useState('');
  const [cargando, setCargando] = useState(false);
  const [resultado, setResultado] = useState<RecuperarResultado | null>(null);
  const [copiado, setCopiado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setCargando(true);
    setError(null);
    try {
      const r = await recuperarPassword(email.trim());
      setResultado(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo procesar la solicitud.');
    } finally {
      setCargando(false);
    }
  }

  async function copiarLink() {
    if (!resultado?.resetUrl) return;
    await navigator.clipboard.writeText(resultado.resetUrl);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1500);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-sunk px-4 py-6">
      <main className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <img src="/img/logo.png" alt="GOPIC" className="h-20 w-20 rounded-full object-cover" />
        </div>

        {resultado ? (
          <div className="rounded-xl border border-border bg-surface p-6 text-center shadow-card">
            {resultado.enviado ? (
              <>
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-success/15 text-success">
                  <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden>
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </span>
                <h1 className="mt-4 font-display text-xl font-semibold text-text">Enviar enlace por WhatsApp</h1>
                <p className="mt-1 text-sm text-text-muted">
                  Encontramos una cuenta con el número <span className="font-medium text-text">{resultado.telefono}</span>.
                  Pulsa el botón para abrir WhatsApp con el enlace ya listo.
                </p>

                <a
                  href={resultado.waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#25D366] px-6 text-lg font-medium text-white transition-colors hover:brightness-95"
                >
                  <Send size={18} /> Enviar a WhatsApp
                </a>

                <button
                  onClick={copiarLink}
                  className="mt-3 inline-flex w-full items-center justify-center gap-1.5 text-sm font-medium text-text-muted hover:text-text"
                >
                  {copiado ? <Check size={16} className="text-success" /> : <Copy size={16} />}
                  {copiado ? 'Enlace copiado' : 'Copiar enlace de restablecimiento'}
                </button>
                <p className="mt-2 text-xs text-text-muted">El enlace vence en 30 minutos.</p>
              </>
            ) : (
              <>
                <h1 className="font-display text-xl font-semibold text-text">Revisa tus datos</h1>
                <p className="mt-1 text-sm text-text-muted">{resultado.mensaje}</p>
              </>
            )}
            <Link
              to={RUTAS.login}
              className="mt-5 inline-flex items-center justify-center gap-1.5 text-sm font-medium text-text-muted hover:text-text"
            >
              <ArrowLeft size={16} /> Volver a iniciar sesión
            </Link>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-surface p-6 shadow-card">
            <h1 className="font-display text-xl font-semibold text-text">Restablecer contraseña</h1>
            <p className="mt-1 text-sm text-text-muted">
              Ingresa tu correo y te enviaremos el enlace por WhatsApp al número registrado.
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

              {error && <p className="text-sm text-danger">{error}</p>}

              <Button type="submit" size="lg" className="w-full" loading={cargando} disabled={!email.trim()}>
                <Send size={18} /> Continuar
              </Button>
            </form>

            <Link
              to={RUTAS.login}
              className="mt-6 flex items-center justify-center gap-1.5 text-sm font-medium text-text-muted hover:text-text"
            >
              <ArrowLeft size={16} /> Volver a iniciar sesión
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
