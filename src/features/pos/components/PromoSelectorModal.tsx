import { X, Tag } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency } from '@/lib/format';
import { usePromociones } from '@/lib/promociones';
import { type PromocionApi as Promocion } from '@/lib/api';
import { descuentoPromo } from '../hooks/usePosTicket';

/** Lista las promociones activas para aplicar una al ticket. */
export function PromoSelectorModal({
  subtotal,
  onCerrar,
  onAplicar,
}: {
  subtotal: number;
  onCerrar: () => void;
  onAplicar: (promo: Promocion) => void;
}) {
  const { data: promos = [] } = usePromociones();
  const activas = promos.filter((p) => p.activa);

  return (
    <Modal onClose={onCerrar} ariaLabel="Aplicar promoción" className="w-full max-w-md">
      <header className="flex items-center justify-between border-b border-border p-4">
        <h3 className="font-display text-lg font-semibold text-text">Aplicar promoción</h3>
        <button
          onClick={onCerrar}
          aria-label="Cerrar"
          className="grid h-9 w-9 place-items-center rounded-md border border-border hover:bg-surface-sunk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-500"
        >
          <X size={18} />
        </button>
      </header>

      <div className="max-h-[60vh] space-y-2 overflow-auto scroll-thin p-4">
        {activas.length === 0 ? (
          <div className="py-8 text-center">
            <Tag size={32} className="mx-auto text-text-muted" />
            <p className="mt-2 text-sm font-medium text-text">No hay promociones activas</p>
            <p className="text-sm text-text-muted">Actívalas en el módulo de Promociones.</p>
          </div>
        ) : (
          activas.map((p) => {
            const desc = Math.min(descuentoPromo(p, subtotal), subtotal);
            return (
              <button
                key={p.id}
                onClick={() => onAplicar(p)}
                className="flex w-full items-center gap-3 rounded-lg border border-border bg-surface p-3 text-left transition-colors hover:border-action-500 hover:bg-action-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-500"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-accent-400/25 text-accent-600">
                  <Tag size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-text">{p.nombre}</div>
                  <div className="text-xs text-text-muted">{p.aplicaEn} · {p.vigencia}</div>
                </div>
                <span className="num shrink-0 text-sm font-semibold text-accent-600">−{formatCurrency(desc)}</span>
              </button>
            );
          })
        )}
      </div>
    </Modal>
  );
}
