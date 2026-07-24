import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { minutesSince } from '@/lib/format';
import { comandas, type Comanda, type EstadoComanda } from '@/mock/data';

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
                  items.map((c) => <ComandaCard key={c.id} comanda={c} estado={col.estado} />)
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ComandaCard({ comanda, estado }: { comanda: Comanda; estado: EstadoComanda }) {
  const min = minutesSince(comanda.creada);
  return (
    <div className={cn('rounded-lg border border-border border-l-4 bg-surface p-3 shadow-card', semaforo(min))}>
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

      <div className="mt-3">
        {estado === 'pendiente' && (
          <Button size="sm" className="w-full">Iniciar preparación</Button>
        )}
        {estado === 'preparacion' && (
          <Button size="sm" className="w-full">Marcar listo</Button>
        )}
        {estado === 'listo' && (
          <Button size="sm" variant="secondary" className="w-full">Marcar entregado</Button>
        )}
      </div>
    </div>
  );
}
