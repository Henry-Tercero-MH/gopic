import { useEffect, useState } from 'react';
import {
  X,
  Clock,
  ChefHat,
  ListChecks,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Trash2,
  ClipboardList,
  History,
  Undo2,
  AlertTriangle,
  Flame,
  type LucideIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { cn } from '@/lib/cn';
import { elapsed, formatTime } from '@/lib/format';
import { useOperacion } from '@/lib/operacion';
import {
  getPreparacion,
  type Comanda,
  type EstadoComanda,
  type Desenlace,
} from '@/mock/data';

const columnas: { estado: EstadoComanda; titulo: string; tono: 'warning' | 'info' | 'success' }[] = [
  { estado: 'pendiente', titulo: 'Pendiente', tono: 'warning' },
  { estado: 'preparacion', titulo: 'En preparación', tono: 'info' },
  { estado: 'listo', titulo: 'Listo para entregar', tono: 'success' },
];

const orden: EstadoComanda[] = ['pendiente', 'preparacion', 'listo'];

/** Umbrales del semáforo por antigüedad (minutos). */
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
  // Fuente única: las comandas viven en el store de operación (llegan desde el POS).
  const { comandas, moverComanda, retirarComanda, restaurarComanda } = useOperacion();

  // Comanda cuya receta se muestra en el panel lateral.
  const [activa, setActiva] = useState<Comanda | null>(null);
  // Panel de historial abierto.
  const [historialAbierto, setHistorialAbierto] = useState(false);
  // Reloj que avanza cada segundo para que los contadores corran en vivo.
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Activas = sin desenlace; historial = entregadas/descartadas.
  const lista = comandas.filter((c) => !c.desenlace);
  const historial = comandas.filter((c) => c.desenlace);

  /** Avanza o retrocede una comanda entre columnas. */
  function mover(id: string, dir: 1 | -1) {
    const c = lista.find((x) => x.id === id);
    if (!c) return;
    const siguiente = orden[orden.indexOf(c.estado) + dir];
    if (siguiente) moverComanda(id, siguiente);
  }

  /** Saca una comanda del tablero con su desenlace: congela el contador y la manda al historial. */
  function retirar(id: string, desenlace: Desenlace) {
    retirarComanda(id, desenlace);
    setActiva((a) => (a?.id === id ? null : a));
  }

  const totalActivas = lista.length;

  return (
    <div className="flex h-full flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-surface px-4 py-4 sm:px-6">
        <div>
          <h1 className="font-display text-xl font-semibold text-text sm:text-2xl lg:text-3xl">Cocina / Barra</h1>
          <p className="text-sm text-text-muted">
            {totalActivas} activas
            {historial.length > 0 && <> · {historial.length} en historial</>}
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="num hidden text-xl font-semibold tabular-nums text-text sm:inline sm:text-2xl lg:text-3xl">{formatTime(new Date(now))}</span>
          <span className="inline-flex items-center gap-2 rounded-full bg-success/12 px-3 py-1 text-xs font-semibold text-success">
            <span className="h-2 w-2 animate-pulse rounded-full bg-success" /> En vivo
          </span>
          <Button size="sm" variant="secondary" onClick={() => setHistorialAbierto(true)}>
            <History size={16} /> Historial
            {historial.length > 0 && (
              <span className="num ml-1 rounded-full bg-brand-100 px-1.5 text-xs font-semibold text-brand-700">
                {historial.length}
              </span>
            )}
          </Button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 overflow-auto scroll-thin p-4 md:grid-cols-3">
        {columnas.map((col) => {
          const items = lista.filter((c) => c.estado === col.estado);
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
                      onVerReceta={() => setActiva(c)}
                      onAvanzar={() => mover(c.id, 1)}
                      onRetroceder={() => mover(c.id, -1)}
                      onEntregar={() => retirar(c.id, 'entregada')}
                      onDescartar={() => retirar(c.id, 'descartada')}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <RecetaDrawer comanda={activa} now={now} onClose={() => setActiva(null)} />
      <HistorialDrawer
        abierto={historialAbierto}
        historial={historial}
        now={now}
        onClose={() => setHistorialAbierto(false)}
        onRestaurar={restaurarComanda}
      />
    </div>
  );
}

function HistorialDrawer({
  abierto,
  historial,
  now,
  onClose,
  onRestaurar,
}: {
  abierto: boolean;
  historial: Comanda[];
  now: number;
  onClose: () => void;
  onRestaurar: (id: string) => void;
}) {
  const entregadas = historial.filter((c) => c.desenlace !== 'descartada').length;
  const descartadas = historial.length - entregadas;

  return (
    <Drawer open={abierto} onClose={onClose} ariaLabel="Historial de comandas">
      <header className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History size={20} className="text-text-muted" />
            <h2 className="font-display text-lg font-semibold text-text">Historial de comandas</h2>
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-md border border-border hover:bg-surface-sunk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-500"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>
        {historial.length > 0 && (
          <div className="mt-3 flex gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-success/12 px-2.5 py-1 text-xs font-semibold text-success">
              <CheckCircle2 size={13} /> {entregadas} entregadas
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-danger/12 px-2.5 py-1 text-xs font-semibold text-danger">
              <Trash2 size={13} /> {descartadas} descartadas
            </span>
          </div>
        )}
      </header>

        <div className="min-h-0 flex-1 overflow-auto scroll-thin p-4">
          {historial.length === 0 ? (
            <div className="grid h-full place-items-center p-6 text-center">
              <div>
                <History size={40} className="mx-auto text-text-muted" />
                <p className="mt-2 font-medium text-text">Sin comandas en el historial</p>
                <p className="text-sm text-text-muted">Las comandas entregadas o descartadas aparecerán aquí.</p>
              </div>
            </div>
          ) : (
            <ul className="space-y-3">
              {historial.map((c) => (
                <li key={c.id} className="rounded-lg border border-border bg-surface-alt p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="num font-semibold text-text">{c.folio}</span>
                      <Badge tone={c.estacion === 'Barra' ? 'brand' : 'accent'}>{c.estacion}</Badge>
                      {c.desenlace === 'descartada' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-danger/12 px-2 py-0.5 text-xs font-semibold text-danger">
                          <Trash2 size={12} /> Descartada
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-success/12 px-2 py-0.5 text-xs font-semibold text-success">
                          <CheckCircle2 size={12} /> Entregada
                        </span>
                      )}
                    </div>
                    <span className="num inline-flex items-center gap-1 text-xs text-text-muted">
                      <Clock size={13} /> {elapsed(c.creada, c.congeladaEn ?? now)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-text-muted">{c.origen}</p>

                  <ul className="mt-2 space-y-0.5 text-sm text-text">
                    {c.items.map((it, i) => (
                      <li key={i}>
                        <span className="num font-semibold text-brand-700">{it.cantidad}×</span> {it.nombre}
                      </li>
                    ))}
                  </ul>

                  <Button size="sm" variant="secondary" className="mt-3 w-full" onClick={() => onRestaurar(c.id)}>
                    <Undo2 size={16} /> Restaurar al tablero
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
    </Drawer>
  );
}

function ComandaCard({
  comanda,
  estado,
  now,
  onVerReceta,
  onAvanzar,
  onRetroceder,
  onEntregar,
  onDescartar,
}: {
  comanda: Comanda;
  estado: EstadoComanda;
  now: number;
  onVerReceta: () => void;
  onAvanzar: () => void;
  onRetroceder: () => void;
  onEntregar: () => void;
  onDescartar: () => void;
}) {
  // Si la comanda ya fue entregada (restaurada), el contador queda congelado.
  const congelada = comanda.congeladaEn != null;
  const ref = comanda.congeladaEn ?? now;
  const min = Math.floor((ref - comanda.creada.getTime()) / 60000);
  const nivel = nivelUrgencia(min);
  const IconoTiempo = congelada ? Clock : iconoTiempoPorNivel[nivel];

  return (
    <div
      className={cn(
        'rounded-lg border border-l-[6px] p-4 shadow-card',
        congelada
          ? 'border-info/40 border-l-info bg-info/5'
          : cn('border-border bg-surface', bordePorNivel[nivel], nivel === 'alto' && 'ring-1 ring-danger/40'),
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="num text-xl font-bold text-text">{comanda.folio}</span>
          {congelada && (
            <Badge tone="info">
              <Undo2 size={12} className="mr-1" /> Restaurada
            </Badge>
          )}
          <button
            onClick={onVerReceta}
            title="Ver receta"
            aria-label="Ver receta"
            className="inline-flex items-center gap-1.5 rounded-md border border-brand-300 bg-brand-50 px-2.5 py-1 text-sm font-semibold text-brand-700 hover:bg-brand-100"
          >
            <ClipboardList size={16} /> Receta
          </button>
        </div>
        <span
          className={cn(
            'num inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-base font-bold tabular-nums',
            congelada ? 'bg-surface-sunk text-text-muted' : chipTiempoPorNivel[nivel],
          )}
          title={congelada ? 'Contador congelado (entregada)' : undefined}
        >
          <IconoTiempo size={16} /> {elapsed(comanda.creada, ref)}
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
              <div className="ml-9 mt-1 rounded bg-accent-400/20 px-2 py-0.5 text-sm font-medium text-accent-600">
                ↳ {it.nota}
              </div>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center gap-2">
        {estado !== 'pendiente' && (
          <button
            onClick={onRetroceder}
            title="Regresar al estado anterior"
            aria-label="Regresar al estado anterior"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-md border border-border bg-surface text-text-muted hover:bg-surface-sunk hover:text-text"
          >
            <ArrowLeft size={20} />
          </button>
        )}

        {estado === 'pendiente' && (
          <Button size="lg" className="flex-1" onClick={onAvanzar}>
            <ChefHat size={18} /> Iniciar
          </Button>
        )}
        {estado === 'preparacion' && (
          <Button size="lg" className="flex-1" onClick={onAvanzar}>
            <CheckCircle2 size={18} /> Marcar listo
          </Button>
        )}
        {estado === 'listo' && (
          <>
            <Button size="lg" className="flex-1" onClick={onEntregar}>
              <ArrowRight size={18} /> Entregar
            </Button>
            <button
              onClick={onDescartar}
              title="Descartar comanda (merma)"
              aria-label="Descartar comanda"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-md border border-border bg-surface text-danger hover:bg-danger/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
            >
              <Trash2 size={20} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function RecetaDrawer({ comanda, now, onClose }: { comanda: Comanda | null; now: number; onClose: () => void }) {
  const abierto = comanda !== null;

  return (
    <Drawer open={abierto} onClose={onClose} ariaLabel="Receta de preparación">
      {comanda && (
        <>
            <header className="flex items-start justify-between border-b border-border p-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="num text-lg font-bold text-text">{comanda.folio}</span>
                  <Badge tone={comanda.estacion === 'Barra' ? 'brand' : 'accent'}>{comanda.estacion}</Badge>
                  <span className="num inline-flex items-center gap-1 text-sm font-semibold text-text-muted">
                    <Clock size={14} /> {elapsed(comanda.creada, now)}
                  </span>
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
              <CheckCircle2 size={18} /> Cerrar guía
            </Button>
          </footer>
        </>
      )}
    </Drawer>
  );
}
