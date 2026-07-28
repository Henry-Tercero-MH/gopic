import { Loader2 } from 'lucide-react';

/** Fallback mientras se carga una ruta con code-splitting (React.lazy + Suspense). */
export function PantallaCarga() {
  return (
    <div className="grid h-full min-h-[60vh] place-items-center text-text-muted">
      <Loader2 size={28} className="animate-spin motion-reduce:animate-none" aria-label="Cargando" />
    </div>
  );
}
