import { useState } from 'react';
import { X, Clock, ChefHat, ListChecks, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { minutesSince } from '@/lib/format';
import { comandas, getPreparacion, type Comanda, type EstadoComanda } from '@/mock/data';

const columnas: { estado: EstadoComanda; titulo: string; tono: 'warning' | 'info' | 'success' }[] = [
  { estado: 'pendiente', titulo: 'Pendiente', tono: 'warning' },
  { estado: 'preparacion', titulo: 'En preparación', tono: 'info' },
  { estado: 'listo', titulo: 'Listo para entregar', tono: 'success' },
];

/** Semáforo por antigüedad de la comanda. */
function semaforo(min: number): string {
  if (min >= 10) return 'border-l-danger';
  if (min >= 5) return 'border-l-accent-600';
  return 'border-l-success';
}

export function KdsPage() {
  // Comanda cuya receta se está mostrando en el panel lateral.
  const [activa, setActiva] = useState<Comanda | null>(null);

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-border bg-surface px-6 py-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-text">Cocina / Barra</h1>
          <p className="text-sm text-text-muted">Comandas en tiempo real · {comandas.length} activas</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-success/12 px-3 py-1 text-xs font-semibold text-success">
          <span className="h-2 w-2 animate-pulse rounded-full bg-success" /> En vivo
        </span>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-auto scroll-thin p-4 md:grid-cols-3">
        {columnas.map((col) => {
          const items = comandas.filter((c) => c.estado === col.estado);
          return (
            <div key={col.estado} className="flex min-h-0 flex-col rounded-lg bg-surface-sunk/60 p-3">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold text-text">{col.titulo}</h2>
                <Badge tone={col.tono}>{items.length}</Badge>
              </div>
              <div className="min-h-0 flex-1 space-y-3 overflow-auto scroll-thin">
                {items.length === 0 ? (
                  <p className="rounded-md border border-dashed border-border p-4 text-center text-sm text-text-muted">
                    Sin comandas
                  </p>
                ) : (
                  items.map((c) => (
                    <ComandaCard key={c.id} comanda={c} estado={col.estado} onVerReceta={() => setActiva(c)} />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <RecetaDrawer comanda={activa} onClose={() => setActiva(null)} />
    </div>
  );
}

function ComandaCard({
  comanda,
  estado,
  onVerReceta,
}: {
  comanda: Comanda;
  estado: EstadoComanda;
  onVerReceta: () => void;
}) {
  const min = minutesSince(comanda.creada);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onVerReceta}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onVerReceta();
        }
      }}
      className={cn(
        'cursor-pointer rounded-lg border border-border border-l-4 bg-surface p-3 shadow-card transition-transform hover:-translate-y-0.5 hover:border-action-500',
        semaforo(min),
      )}
    >
      <div className="flex items-center justify-between">
        <span className="num font-semibold text-text">{comanda.folio}</span>
        <span className="num text-xs text-text-muted">{min} min</span>
      </div>
      <div className="mt-0.5 flex items-center gap-2 text-xs text-text-muted">
        <span>{comanda.origen}</span>
        <Badge tone={comanda.estacion === 'Barra' ? 'brand' : 'accent'}>{comanda.estacion}</Badge>
      </div>

      <ul className="mt-3 space-y-1.5">
        {comanda.items.map((it, i) => (
          <li key={i} className="text-sm">
            <div className="flex gap-2">
              <span className="num font-semibold text-brand-700">{it.cantidad}×</span>
              <span className="font-medium text-text">{it.nombre}</span>
            </div>
            {it.nota && <div className="ml-6 text-xs italic text-accent-600">↳ {it.nota}</div>}
          </li>
        ))}
      </ul>

      {/* Los botones no deben propagar el clic que abre el panel de receta */}
      <div className="mt-3" onClick={(e) => e.stopPropagation()}>
        {estado === 'pendiente' && (
          <Button size="sm" className="w-full" onClick={onVerReceta}>
            <ChefHat size={16} /> Iniciar preparación
          </Button>
        )}
        {estado === 'preparacion' && (
          <Button size="sm" className="w-full">
            <CheckCircle2 size={16} /> Marcar listo
          </Button>
        )}
        {estado === 'listo' && (
          <Button size="sm" variant="secondary" className="w-full">
            Marcar entregado
          </Button>
        )}
      </div>
    </div>
  );
}

function RecetaDrawer({ comanda, onClose }: { comanda: Comanda | null; onClose: () => void }) {
  const abierto = comanda !== null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={cn(
          'fixed inset-0 z-modal bg-text/40 transition-opacity duration-100',
          abierto ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        aria-hidden
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Receta de preparación"
        className={cn(
          'fixed right-0 top-0 z-modal flex h-full w-full max-w-md flex-col bg-surface shadow-modal transition-transform duration-100 ease-out',
          abierto ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {comanda && (
          <>
            <header className="flex items-start justify-between border-b border-border p-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="num font-semibold text-text">{comanda.folio}</span>
                  <Badge tone={comanda.estacion === 'Barra' ? 'brand' : 'accent'}>{comanda.estacion}</Badge>
                </div>
                <p className="mt-0.5 text-sm text-text-muted">{comanda.origen} · Guía de preparación</p>
              </div>
              <button
                onClick={onClose}
                className="grid h-9 w-9 place-items-center rounded-md border border-border hover:bg-surface-sunk"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </header>

            <div className="min-h-0 flex-1 space-y-4 overflow-auto scroll-thin p-4">
              {comanda.items.map((it, i) => {
                const receta = getPreparacion(it.nombre);
                return (
                  <div key={i} className="rounded-lg border border-border bg-surface-alt p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-display text-lg font-semibold text-text">
                        <span className="num text-brand-700">{it.cantidad}×</span> {it.nombre}
                      </h3>
                      <span className="num inline-flex items-center gap-1 text-xs text-text-muted">
                        <Clock size={13} /> {receta.tiempoMin} min
                      </span>
                    </div>

                    {it.nota && (
                      <div className="mt-2 rounded-md bg-accent-400/20 px-3 py-1.5 text-sm font-medium text-accent-600">
                        Nota del cliente: {it.nota}
                      </div>
                    )}

                    <div className="mt-3">
                      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-text-muted">
                        <ListChecks size={14} /> Ingredientes
                      </div>
                      <ul className="mt-1.5 space-y-1">
                        {receta.ingredientes.map((ing, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm text-text">
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-action-500" />
                            {ing}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-3">
                      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-text-muted">
                        <ChefHat size={14} /> Pasos
                      </div>
                      <ol className="mt-1.5 space-y-1.5">
                        {receta.pasos.map((paso, j) => (
                          <li key={j} className="flex gap-2 text-sm text-text">
                            <span className="num grid h-5 w-5 shrink-0 place-items-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                              {j + 1}
                            </span>
                            {paso}
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                );
              })}
            </div>

            <footer className="border-t border-border p-4">
              <Button className="w-full" size="lg" onClick={onClose}>
                <CheckCircle2 size={18} /> Comenzar preparación
              </Button>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}
