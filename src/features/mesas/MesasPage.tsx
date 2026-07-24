import { Users } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';
import { formatCurrency } from '@/lib/format';
import { mesas, type EstadoMesa, type Mesa } from '@/mock/data';

const estadoConfig: Record<EstadoMesa, { label: string; tone: 'neutral' | 'action' | 'warning' | 'info'; ring: string }> = {
  libre: { label: 'Libre', tone: 'neutral', ring: 'border-border' },
  ocupada: { label: 'Ocupada', tone: 'action', ring: 'border-action-500' },
  cuenta: { label: 'Pidió cuenta', tone: 'warning', ring: 'border-accent-600' },
  reservada: { label: 'Reservada', tone: 'info', ring: 'border-info' },
};

export function MesasPage() {
  const zonas = [...new Set(mesas.map((m) => m.zona))];
  const ocupadas = mesas.filter((m) => m.estado !== 'libre' && m.estado !== 'reservada').length;

  return (
    <div className="space-y-6 p-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-semibold text-text">Mapa de mesas</h1>
          <p className="text-sm text-text-muted">
            {ocupadas} de {mesas.length} en servicio
          </p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          {(Object.keys(estadoConfig) as EstadoMesa[]).map((e) => (
            <span key={e} className="inline-flex items-center gap-1.5 text-text-muted">
              <span className={cn('h-3 w-3 rounded-full border-2', estadoConfig[e].ring)} />
              {estadoConfig[e].label}
            </span>
          ))}
        </div>
      </header>

      {zonas.map((zona) => (
        <section key={zona}>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">{zona}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {mesas.filter((m) => m.zona === zona).map((m) => (
              <MesaCard key={m.id} mesa={m} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function MesaCard({ mesa }: { mesa: Mesa }) {
  const cfg = estadoConfig[mesa.estado];
  return (
    <button
      className={cn(
        'flex flex-col rounded-lg border-2 bg-surface p-4 text-left shadow-card transition-transform hover:-translate-y-0.5',
        cfg.ring,
      )}
    >
      <div className="flex items-start justify-between">
        <span className="font-display text-lg font-semibold text-text">{mesa.nombre}</span>
        <Badge tone={cfg.tone}>{cfg.label}</Badge>
      </div>
      <span className="mt-1 inline-flex items-center gap-1 text-xs text-text-muted">
        <Users size={13} /> {mesa.capacidad} personas
      </span>

      {mesa.estado === 'libre' ? (
        <span className="mt-4 text-sm text-text-muted">Toca para abrir cuenta</span>
      ) : mesa.estado === 'reservada' ? (
        <span className="mt-4 text-sm text-info">Reservada 19:00</span>
      ) : (
        <div className="mt-4 space-y-1">
          <div className="num text-xl font-semibold text-brand-700">{formatCurrency(mesa.totalActual ?? 0)}</div>
          <div className="text-xs text-text-muted">
            {mesa.mesero} · {mesa.minutos} min
          </div>
        </div>
      )}
    </button>
  );
}
