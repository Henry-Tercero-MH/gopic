import { useMemo, useState } from 'react';
import { X, Plus, Minus, Check } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { formatCurrency } from '@/lib/format';
import { type LineaTicket } from '@/lib/operacion';

/** Divide la cuenta en partes iguales (reconciliando centavos) o por comensal. */
export function DividirCuentaModal({
  lineas,
  total,
  onCerrar,
}: {
  lineas: LineaTicket[];
  total: number;
  onCerrar: () => void;
}) {
  const [modo, setModo] = useState<'iguales' | 'producto'>('iguales');
  const [personas, setPersonas] = useState(2);

  // Modo "por producto": expandimos por unidad para poder asignar cada una.
  const unidades = useMemo(
    () =>
      lineas.flatMap((l, li) =>
        Array.from({ length: l.cantidad }, (_, ui) => ({
          key: `${li}-${ui}`,
          nombre: l.nombre,
          precio: l.precio,
        })),
      ),
    [lineas],
  );
  // asignacion[key] = índice de pagador (0..personas-1)
  const [asignacion, setAsignacion] = useState<Record<string, number>>({});

  /** Cambia el número de personas; al reducir, limpia asignaciones a comensales que ya no existen. */
  function cambiarPersonas(delta: number) {
    setPersonas((n) => {
      const next = Math.min(8, Math.max(2, n + delta));
      if (next < n) {
        setAsignacion((prev) => {
          const copia = { ...prev };
          for (const k of Object.keys(copia)) if (copia[k] >= next) delete copia[k];
          return copia;
        });
      }
      return next;
    });
  }

  // Reparto en partes iguales al centavo: el sobrante se reparte de 1¢ en 1¢
  // entre las primeras personas, para que la suma cuadre exactamente con el total.
  const centavosTotal = Math.round(total * 100);
  const base = Math.floor(centavosTotal / personas);
  const resto = centavosTotal - base * personas; // nº de personas que pagan 1¢ más
  const montoBase = base / 100;
  const montoAlto = (base + 1) / 100;

  // Totales por pagador en modo producto.
  const totalesProducto = Array.from({ length: personas }, (_, p) =>
    unidades.filter((u) => asignacion[u.key] === p).reduce((s, u) => s + u.precio, 0),
  );
  const sinAsignar = unidades.filter((u) => asignacion[u.key] === undefined).length;

  return (
    <Modal onClose={onCerrar} ariaLabel="Dividir cuenta" className="w-full max-w-lg">
      <header className="flex items-center justify-between border-b border-border p-4">
        <div>
          <h3 className="font-display text-lg font-semibold text-text">Dividir cuenta</h3>
          <p className="num text-sm text-text-muted">Total: {formatCurrency(total)}</p>
        </div>
        <button
          onClick={onCerrar}
          aria-label="Cerrar"
          className="grid h-9 w-9 place-items-center rounded-md border border-border hover:bg-surface-sunk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-500"
        >
          <X size={18} />
        </button>
      </header>

      <div className="space-y-4 p-4">
        {/* Selector de modo */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setModo('iguales')}
            className={cn(
              'rounded-lg border p-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-500',
              modo === 'iguales' ? 'border-action-500 bg-action-50 text-action-700' : 'border-border bg-surface text-text-muted hover:bg-surface-sunk',
            )}
          >
            Partes iguales
          </button>
          <button
            onClick={() => setModo('producto')}
            className={cn(
              'rounded-lg border p-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-500',
              modo === 'producto' ? 'border-action-500 bg-action-50 text-action-700' : 'border-border bg-surface text-text-muted hover:bg-surface-sunk',
            )}
          >
            Por comensal
          </button>
        </div>

        {/* Número de personas */}
        <div className="flex items-center justify-between rounded-lg bg-surface-alt px-4 py-3">
          <span className="text-sm font-medium text-text">¿Entre cuántas personas?</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => cambiarPersonas(-1)}
              aria-label="Menos personas"
              className="grid h-9 w-9 place-items-center rounded-md border border-border hover:bg-surface-sunk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-500"
            >
              <Minus size={16} />
            </button>
            <span className="num w-6 text-center text-lg font-semibold text-text">{personas}</span>
            <button
              onClick={() => cambiarPersonas(1)}
              aria-label="Más personas"
              className="grid h-9 w-9 place-items-center rounded-md border border-border hover:bg-surface-sunk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-500"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {modo === 'iguales' ? (
          <div className="rounded-lg border border-action-500 bg-action-50/40 p-4 text-center">
            <p className="text-sm text-text-muted">Cada persona paga</p>
            <p className="num mt-1 text-3xl font-semibold text-action-700">{formatCurrency(montoBase)}</p>
            {resto === 0 ? (
              <p className="mt-1 text-xs text-text-muted">
                {personas} × {formatCurrency(montoBase)} = {formatCurrency(total)}
              </p>
            ) : (
              <p className="mt-1 text-xs text-text-muted">
                {resto} {resto === 1 ? 'persona paga' : 'personas pagan'} {formatCurrency(montoAlto)} (ajuste de redondeo) ·
                suma exacta {formatCurrency(total)}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-text-muted">
              Toca cada producto para asignarlo a una persona.
              {sinAsignar > 0 && <span className="text-warning"> Quedan {sinAsignar} sin asignar.</span>}
            </p>
            <ul className="max-h-48 space-y-1.5 overflow-auto scroll-thin">
              {unidades.map((u) => {
                const asignado = asignacion[u.key];
                return (
                  <li key={u.key} className="flex items-center justify-between gap-2 rounded-md bg-surface-alt px-3 py-2">
                    <span className="min-w-0 flex-1 truncate text-sm text-text">{u.nombre}</span>
                    <span className="num text-xs text-text-muted">{formatCurrency(u.precio)}</span>
                    <div className="flex gap-1">
                      {Array.from({ length: personas }, (_, p) => (
                        <button
                          key={p}
                          onClick={() =>
                            setAsignacion((prev) => {
                              const copia = { ...prev };
                              if (copia[u.key] === p) delete copia[u.key];
                              else copia[u.key] = p;
                              return copia;
                            })
                          }
                          aria-pressed={asignado === p}
                          className={cn(
                            'num grid h-9 w-9 place-items-center rounded-md border text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-500',
                            asignado === p ? 'border-action-500 bg-action-500 text-on-action' : 'border-border text-text-muted hover:bg-surface-sunk',
                          )}
                          aria-label={asignado === p ? `Quitar de comensal ${p + 1}` : `Asignar a comensal ${p + 1}`}
                        >
                          {p + 1}
                        </button>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="grid grid-cols-2 gap-2">
              {totalesProducto.map((t, p) => (
                <div key={p} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                  <span className="text-sm font-medium text-text">Comensal {p + 1}</span>
                  <span className="num text-sm font-semibold text-text">{formatCurrency(t)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer className="flex justify-end gap-2 border-t border-border p-4">
        <Button variant="secondary" onClick={onCerrar}>Cerrar</Button>
        <Button onClick={onCerrar}>
          <Check size={18} /> Listo
        </Button>
      </footer>
    </Modal>
  );
}
