import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="grid min-h-full place-items-center bg-surface-sunk p-4 text-center">
      <div>
        <Compass size={48} className="mx-auto text-text-muted" />
        <h1 className="mt-3 font-display text-3xl font-semibold text-text">Página no encontrada</h1>
        <p className="mt-1 text-sm text-text-muted">La ruta que buscas no existe o fue movida.</p>
        <Link
          to="/"
          className="mt-5 inline-flex items-center gap-2 rounded-md bg-action-500 px-5 py-2.5 text-base font-medium text-text-invert hover:bg-action-600"
        >
          <Home size={18} /> Volver al inicio
        </Link>
      </div>
    </div>
  );
}
