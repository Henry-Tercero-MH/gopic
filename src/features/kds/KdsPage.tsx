import { useEffect, useState } from 'react';
import {
  X,
  Clock,
  ChefHat,
  ListChecks,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  ClipboardList,
  AlertTriangle,
  Flame,
  Loader2,
  History,
  type LucideIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { cn } from '@/lib/cn';
import { elapsed, formatTime } from '@/lib/format';
import { useComandas, useAvanzarComanda, useHistorialComandas } from '@/lib/comandas';
import { type ComandaApi, type EstadoComandaApi } from '@/lib/api';
import { getPreparacion } from '@/mock/data';

type EstadoActivo = 'pendiente' | 'preparacion' | 'listo';

const columnas: { estado: EstadoActivo; titulo: string; tono: 'warning' | 'info' | 'success' }[] = [
  { estado: 'pendiente', titulo: 'Pendiente', tono: 'warning' },
  { estado: 'preparacion', titulo: 'En preparación', tono: 'info' },
  { estado: 'listo', titulo: 'Listo para entregar', tono: 'success' },
];

const orden: EstadoActivo[] = ['pendiente', 'preparacion', 'listo'];

function nivelUrgencia(min: number): 'ok' | 'medio' | 'alto' {
  if (min >= 10) return 'alto';
  if (min >= 5) return 'medio';
  return 'ok';
}

const bordePorNivel: Record<'ok' | 'medio' | 'alto', string> = {
  ok: 'border-l-success',
  medio: 'border-l-accent-600',
  alto: 'border-l-danger',
};
const chipTiempoPorNivel: Record<'ok' | 'medio' | 'alto', string> = {
  ok: 'bg-success/15 text-success',
  medio: 'bg-accent-400/25 text-accent-600',
  alto: 'bg-danger/15 text-danger',
};
/** Icono por nivel: el color NO es el único portador de la urgencia (WCAG 1.4.1). */
const iconoTiempoPorNivel: Record<'ok' | 'medio' | 'alto', LucideIcon> = {
  ok: Clock,
  medio: AlertTriangle,
  alto: Flame,
};

export function KdsPage() {
  const { data: comandas = [], isLoading, isError } = useComandas();
  const avanzar = useAvanzarComanda();
  const [activa, setActiva] = useState<ComandaApi | null>(null);
  const [historialAbierto, setHistorialAbierto] = useState(false);
  const { data: historial = [], isLoading: cargandoHistorial } = useHistorialComandas(historialAbierto);

  // Reloj que avanza cada segundo para los contadores en vivo.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const mover = (c: ComandaApi, dir: 1 | -1) => {
    const siguiente = orden[orden.indexOf(c.estado as EstadoActivo) + dir];
    if (siguiente) avanzar.mutate({ id: c.id, estado: siguiente });
  };
  const entregar = (c: ComandaApi) => {
    avanzar.mutate({ id: c.id, estado: 'entregada' as EstadoComandaApi });
    setActiva((a) => (a?.id === c.id ? null : a));
  };

  return (
    <div className="flex h-full flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-4 py-4 sm:px-6">
        <div>
          <h1 className="font-display text-xl font-semibold text-text sm:text-2xl lg:text-3xl">Cocina / Barra</h1>
          <p className="text-sm text-text-muted">{comandas.length} activas</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="num hidden text-xl font-semibold tabular-nums text-text sm:inline sm:text-2xl">
            {formatTime(new Date(now))}
          </span>
          <Button variant="secondary" size="sm" onClick={() => setHistorialAbierto(true)}>
            <History size={18} /> Historial
          </Button>
          <span className="inline-flex items-center gap-2 rounded-full bg-success/12 px-3 py-1 text-xs font-semibold text-success">
            <span className="h-2 w-2 animate-pulse rounded-full bg-success motion-reduce:animate-none" /> En vivo
          </span>
        </div>
      </header>

      {isLoading ? (
        <div className="grid flex-1 place-items-center text-text-muted">
          <Loader2 size={28} className="animate-spin motion-reduce:animate-none" aria-label="Cargando" />
        </div>
      ) : isError ? (
        <div className="grid flex-1 place-items-center text-center text-sm text-danger">
          No se pudo cargar el tablero de comandas.
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-auto scroll-thin p-4 md:grid-cols-3">
          {columnas.map((col) => {
            const items = comandas.filter((c) => c.estado === col.estado);
            return (
              <div key={col.estado} className="flex min-h-0 flex-col rounded-lg bg-surface-sunk/60 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-text">{col.titulo}</h2>
                  <Badge tone={col.tono}>{items.length}</Badge>
                </div>
                <div className="min-h-0 flex-1 space-y-3 overflow-auto scroll-thin">
                  {items.length === 0 ? (
                    <p className="rounded-md border border-dashed border-border p-6 text-center text-sm text-text-muted">
                      Sin comandas
                    </p>
                  ) : (
                    items.map((c) => (
                      <ComandaCard
                        key={c.id}
                        comanda={c}
                        estado={col.estado}
                        now={now}
                        ocupado={avanzar.isPending}
                        onVerReceta={() => setActiva(c)}
                        onAvanzar={() => mover(c, 1)}
                        onRetroceder={() => mover(c, -1)}
                        onEntregar={() => entregar(c)}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <RecetaDrawer comanda={activa} now={now} onClose={() => setActiva(null)} />
      <HistorialDrawer
        abierto={historialAbierto}
        cargando={cargandoHistorial}
        comandas={historial}
        onClose={() => setHistorialAbierto(false)}
      />
    </div>
  );
}

function HistorialDrawer({
  abierto,
  cargando,
  comandas,
  onClose,
}: {
  abierto: boolean;
  cargando: boolean;
  comandas: import('@/lib/api').ComandaHistorialApi[];
  onClose: () => void;
}) {
  return (
    <Drawer open={abierto} onClose={onClose} ariaLabel="Historial de comandas entregadas">
      <header className="flex items-start justify-between border-b border-border p-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-text">Historial de comandas</h2>
          <p className="mt-0.5 text-sm text-text-muted">Últimas {comandas.length} entregadas</p>
        </div>
        <button onClick={onClose} aria-label="Cerrar" className="grid h-9 w-9 place-items-center rounded-md border border-border hover:bg-surface-sunk">
          <X size={18} />
        </button>
      </header>

      <div className="min-h-0 flex-1 space-y-3 overflow-auto scroll-thin p-4">
        {cargando ? (
          <div className="grid place-items-center py-10 text-text-muted">
            <Loader2 size={24} className="animate-spin motion-reduce:animate-none" aria-label="Cargando" />
          </div>
        ) : comandas.length === 0 ? (
          <p className="rounded-md border border-dashed border-border p-6 text-center text-sm text-text-muted">
            Aún no hay comandas entregadas.
          </p>
        ) : (
          comandas.map((c) => (
            <div key={c.id} className="rounded-lg border border-border bg-surface p-3 shadow-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="num text-base font-bold text-text">{c.folio}</span>
                  <Badge tone={c.estacion === 'Barra' ? 'brand' : 'accent'}>{c.estacion}</Badge>
                </div>
                <span className="num inline-flex items-center gap-1 text-xs text-text-muted">
                  <CheckCircle2 size={13} className="text-success" />
                  {new Date(c.entregadaEn).toLocaleTimeString('es-GT', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-text-muted">{c.origen}</p>
              <ul className="mt-2 space-y-1 border-t border-border pt-2">
                {c.items.map((it, i) => (
                  <li key={i} className="flex items-baseline gap-2 text-sm text-text">
                    <span className="num font-semibold text-brand-700">{it.cantidad}×</span>
                    <span>{it.nombre}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </Drawer>
  );
}

function ComandaCard({
  comanda,
  estado,
  now,
  ocupado,
  onVerReceta,
  onAvanzar,
  onRetroceder,
  onEntregar,
}: {
  comanda: ComandaApi;
  estado: EstadoActivo;
  now: number;
  ocupado: boolean;
  onVerReceta: () => void;
  onAvanzar: () => void;
  onRetroceder: () => void;
  onEntregar: () => void;
}) {
  const creada = new Date(comanda.creadaEn);
  const min = Math.floor((now - creada.getTime()) / 60000);
  const nivel = nivelUrgencia(min);
  const IconoTiempo = iconoTiempoPorNivel[nivel];

  return (
    <div className={cn('rounded-lg border border-l-[6px] border-border bg-surface p-4 shadow-card', bordePorNivel[nivel], nivel === 'alto' && 'ring-1 ring-danger/40')}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="num text-xl font-bold text-text">{comanda.folio}</span>
          <button
            onClick={onVerReceta}
            title="Ver receta"
            aria-label="Ver receta"
            className="inline-flex items-center gap-1.5 rounded-md border border-brand-300 bg-brand-50 px-2.5 py-1 text-sm font-semibold text-brand-700 hover:bg-brand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-500"
          >
            <ClipboardList size={16} /> Receta
          </button>
        </div>
        <span className={cn('num inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-base font-bold tabular-nums', chipTiempoPorNivel[nivel])}>
          <IconoTiempo size={16} /> {elapsed(creada, now)}
        </span>
      </div>
      <div className="mt-1 flex items-center gap-2 text-sm text-text-muted">
        <span className="font-medium">{comanda.origen}</span>
        <Badge tone={comanda.estacion === 'Barra' ? 'brand' : 'accent'}>{comanda.estacion}</Badge>
      </div>

      <ul className="mt-3 space-y-2 border-t border-border pt-3">
        {comanda.items.map((it, i) => (
          <li key={i}>
            <div className="flex items-baseline gap-2.5">
              <span className="num grid h-7 min-w-7 shrink-0 place-items-center rounded-md bg-brand-100 px-1.5 text-base font-bold text-brand-700">
                {it.cantidad}
              </span>
              <span className="text-lg font-semibold leading-tight text-text">{it.nombre}</span>
            </div>
            {it.nota && (
              <div className="ml-9 mt-1 rounded bg-accent-400/20 px-2 py-0.5 text-sm font-medium text-accent-600">↳ {it.nota}</div>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center gap-2">
        {estado !== 'pendiente' && (
          <button
            onClick={onRetroceder}
            disabled={ocupado}
            title="Regresar al estado anterior"
            aria-label="Regresar al estado anterior"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-md border border-border bg-surface text-text-muted hover:bg-surface-sunk hover:text-text disabled:opacity-50"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        {estado === 'pendiente' && (
          <Button size="lg" className="flex-1" disabled={ocupado} onClick={onAvanzar}>
            <ChefHat size={18} /> Iniciar
          </Button>
        )}
        {estado === 'preparacion' && (
          <Button size="lg" className="flex-1" disabled={ocupado} onClick={onAvanzar}>
            <CheckCircle2 size={18} /> Marcar listo
          </Button>
        )}
        {estado === 'listo' && (
          <Button size="lg" className="flex-1" disabled={ocupado} onClick={onEntregar}>
            <ArrowRight size={18} /> Entregar
          </Button>
        )}
      </div>
    </div>
  );
}

function RecetaDrawer({ comanda, now, onClose }: { comanda: ComandaApi | null; now: number; onClose: () => void }) {
  return (
    <Drawer open={comanda !== null} onClose={onClose} ariaLabel="Receta de preparación">
      {comanda && (
        <>
          <header className="flex items-start justify-between border-b border-border p-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="num text-lg font-bold text-text">{comanda.folio}</span>
                <Badge tone={comanda.estacion === 'Barra' ? 'brand' : 'accent'}>{comanda.estacion}</Badge>
                <span className="num inline-flex items-center gap-1 text-sm font-semibold text-text-muted">
                  <Clock size={14} /> {elapsed(new Date(comanda.creadaEn), now)}
                </span>
              </div>
              <p className="mt-0.5 text-sm text-text-muted">{comanda.origen} · Guía de preparación</p>
            </div>
            <button onClick={onClose} aria-label="Cerrar" className="grid h-9 w-9 place-items-center rounded-md border border-border hover:bg-surface-sunk">
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
              <CheckCircle2 size={18} /> Cerrar guía
            </Button>
          </footer>
        </>
      )}
    </Drawer>
  );
}
