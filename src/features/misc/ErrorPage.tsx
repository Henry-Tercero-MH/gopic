import { useRouteError, Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';
import { RUTAS } from '@/lib/rutas';

/**
 * `errorElement` del router: captura errores de render/carga de cualquier ruta
 * y muestra una salida amable en vez de una pantalla en blanco.
 */
export function ErrorPage() {
  const error = useRouteError();
  const mensaje =
    error instanceof Error ? error.message : typeof error === 'string' ? error : 'Ocurrió un error inesperado.';

  return (
    <div className="grid min-h-screen place-items-center bg-surface-sunk p-6 text-center">
      <div className="max-w-md">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-danger/15 text-danger">
          <AlertTriangle size={28} />
        </span>
        <h1 className="mt-4 font-display text-2xl font-semibold text-text">Algo salió mal</h1>
        <p className="mt-1 text-sm text-text-muted">
          No pudimos mostrar esta pantalla. Intenta de nuevo o vuelve al inicio.
        </p>
        <pre className="mt-3 overflow-x-auto rounded-md bg-surface-alt px-3 py-2 text-left text-xs text-text-muted">
          {mensaje}
        </pre>
        <Link
          to={RUTAS.dashboard}
          className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-action-500 px-5 font-medium text-on-action hover:bg-action-600"
        >
          <Home size={18} /> Ir al inicio
        </Link>
      </div>
    </div>
  );
}
