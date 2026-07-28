import { useState } from 'react';
import { X, Check, Plus } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';
import { formatCurrency } from '@/lib/format';
import { gruposModificadores, type Producto, type GrupoModificador, type OpcionModificador } from '@/mock/data';

/** Elige los modificadores de un producto (tamaño, extras, "sin…") antes de agregarlo. */
export function ModificadoresModal({
  producto,
  onCerrar,
  onAgregar,
}: {
  producto: Producto;
  onCerrar: () => void;
  onAgregar: (extraPrecio: number, nota: string) => void;
}) {
  const grupos = (producto.modificadores ?? [])
    .map((id) => gruposModificadores.find((g) => g.id === id))
    .filter((g): g is GrupoModificador => Boolean(g));

  // Selección: para grupos únicos, la primera opción por defecto; múltiples arrancan vacíos.
  const [seleccion, setSeleccion] = useState<Record<string, string[]>>(() => {
    const inicial: Record<string, string[]> = {};
    for (const g of grupos) inicial[g.id] = !g.multiple && g.requerido ? [g.opciones[0].id] : [];
    return inicial;
  });

  function toggle(grupo: GrupoModificador, opcion: OpcionModificador) {
    setSeleccion((prev) => {
      const actual = prev[grupo.id] ?? [];
      if (grupo.multiple) {
        return { ...prev, [grupo.id]: actual.includes(opcion.id) ? actual.filter((x) => x !== opcion.id) : [...actual, opcion.id] };
      }
      return { ...prev, [grupo.id]: [opcion.id] };
    });
  }

  // Todos los grupos requeridos deben tener selección.
  const completo = grupos.every((g) => !g.requerido || (seleccion[g.id]?.length ?? 0) > 0);

  const opcionesElegidas: OpcionModificador[] = grupos.flatMap((g) =>
    (seleccion[g.id] ?? []).map((oid) => g.opciones.find((o) => o.id === oid)!).filter(Boolean),
  );
  const extra = opcionesElegidas.reduce((s, o) => s + o.precio, 0);
  const nota = opcionesElegidas.map((o) => o.nombre).join(', ');
  const precioFinal = producto.precio + extra;

  return (
    <Modal onClose={onCerrar} ariaLabel={`Personalizar ${producto.nombre}`} className="w-full max-w-md">
      <header className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden>{producto.emoji}</span>
          <div>
            <h3 className="font-display text-lg font-semibold text-text">{producto.nombre}</h3>
            <p className="num text-xs text-text-muted">Base {formatCurrency(producto.precio)}</p>
          </div>
        </div>
        <button
          onClick={onCerrar}
          aria-label="Cerrar"
          className="grid h-9 w-9 place-items-center rounded-md border border-border hover:bg-surface-sunk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-500"
        >
          <X size={18} />
        </button>
      </header>

      <div className="max-h-[55vh] space-y-4 overflow-auto scroll-thin p-4">
        {grupos.map((g) => (
          <div key={g.id}>
            <div className="mb-1.5 flex items-center gap-2">
              <span className="text-sm font-semibold text-text">{g.nombre}</span>
              {g.requerido ? (
                <Badge tone="brand">Obligatorio</Badge>
              ) : (
                <span className="text-xs text-text-muted">Opcional{g.multiple ? ' · varios' : ''}</span>
              )}
            </div>
            <div className="space-y-1.5">
              {g.opciones.map((o) => {
                const activo = (seleccion[g.id] ?? []).includes(o.id);
                return (
                  <button
                    key={o.id}
                    onClick={() => toggle(g, o)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-500',
                      activo ? 'border-action-500 bg-action-50 text-action-700' : 'border-border bg-surface text-text hover:bg-surface-sunk',
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span className={cn(
                        'grid h-4 w-4 shrink-0 place-items-center border',
                        g.multiple ? 'rounded' : 'rounded-full',
                        activo ? 'border-action-500 bg-action-500 text-text-invert' : 'border-border',
                      )}>
                        {activo && <Check size={11} />}
                      </span>
                      {o.nombre}
                    </span>
                    {o.precio > 0 && <span className="num text-text-muted">+{formatCurrency(o.precio)}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <footer className="border-t border-border p-4">
        <Button size="lg" className="w-full" disabled={!completo} onClick={() => onAgregar(extra, nota)}>
          <Plus size={18} /> Agregar · {formatCurrency(precioFinal)}
        </Button>
      </footer>
    </Modal>
  );
}
