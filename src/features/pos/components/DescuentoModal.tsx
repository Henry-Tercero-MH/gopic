import { useState } from 'react';
import { X } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { formatCurrency } from '@/lib/format';

/** Aplica un descuento manual (porcentaje o monto fijo) al ticket. */
export function DescuentoModal({
  subtotal,
  actual,
  onCerrar,
  onAplicar,
}: {
  subtotal: number;
  actual: number;
  onCerrar: () => void;
  onAplicar: (monto: number) => void;
}) {
  const [tipo, setTipo] = useState<'pct' | 'fijo'>('pct');
  const [valor, setValor] = useState(actual > 0 ? String(actual) : '');

  const valorNum = parseFloat(valor) || 0;
  const monto = tipo === 'pct' ? (subtotal * valorNum) / 100 : valorNum;
  const montoAplicado = Math.min(Math.max(0, monto), subtotal);
  const totalConDcto = subtotal - montoAplicado;

  return (
    <Modal onClose={onCerrar} ariaLabel="Aplicar descuento" className="w-full max-w-sm">
      <header className="flex items-center justify-between border-b border-border p-4">
        <h3 className="font-display text-lg font-semibold text-text">Descuento</h3>
        <button
          onClick={onCerrar}
          aria-label="Cerrar"
          className="grid h-9 w-9 place-items-center rounded-md border border-border hover:bg-surface-sunk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-500"
        >
          <X size={18} />
        </button>
      </header>

      <div className="space-y-4 p-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setTipo('pct')}
            className={cn(
              'rounded-lg border p-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-500',
              tipo === 'pct'
                ? 'border-action-500 bg-action-50 text-action-700'
                : 'border-border bg-surface text-text-muted hover:bg-surface-sunk',
            )}
          >
            Porcentaje %
          </button>
          <button
            onClick={() => setTipo('fijo')}
            className={cn(
              'rounded-lg border p-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-500',
              tipo === 'fijo'
                ? 'border-action-500 bg-action-50 text-action-700'
                : 'border-border bg-surface text-text-muted hover:bg-surface-sunk',
            )}
          >
            Monto fijo Q
          </button>
        </div>

        <div>
          <label htmlFor="dcto-valor" className="mb-1 block text-sm font-medium text-text">
            {tipo === 'pct' ? 'Porcentaje a descontar' : 'Monto a descontar'}
          </label>
          <input
            id="dcto-valor"
            type="number"
            inputMode="decimal"
            min={0}
            max={tipo === 'pct' ? 100 : subtotal}
            autoFocus
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder={tipo === 'pct' ? '0 %' : '0.00'}
            className="num h-12 w-full rounded-md border border-border bg-surface-alt px-3 text-right text-xl font-semibold text-text focus:border-action-500 focus:outline-none focus:ring-2 focus:ring-action-500/40"
          />
        </div>

        <dl className="space-y-1 rounded-lg bg-surface-alt p-3 text-sm">
          <div className="flex justify-between text-success">
            <dt>Descuento</dt>
            <dd className="num">−{formatCurrency(montoAplicado)}</dd>
          </div>
          <div className="flex justify-between font-semibold text-text">
            <dt>Total con descuento</dt>
            <dd className="num">{formatCurrency(totalConDcto)}</dd>
          </div>
        </dl>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" size="lg" onClick={() => onAplicar(0)}>
            Quitar
          </Button>
          <Button size="lg" onClick={() => onAplicar(montoAplicado)}>
            Aplicar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
