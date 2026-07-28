import { useState } from 'react';
import { Calculator, X } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { formatCurrency } from '@/lib/format';
import { DENOMINACIONES } from '../constantes';

/** Calculadora de vuelto independiente: se abre desde el header del ticket. */
export function CalculadoraVueltoModal({ totalInicial, onCerrar }: { totalInicial: number; onCerrar: () => void }) {
  const [totalStr, setTotalStr] = useState(totalInicial > 0 ? String(totalInicial) : '');
  const [recibidoStr, setRecibidoStr] = useState('');

  const totalNum = parseFloat(totalStr) || 0;
  const recibidoNum = parseFloat(recibidoStr) || 0;
  const vuelto = recibidoNum - totalNum;
  const suficiente = recibidoNum >= totalNum && recibidoNum > 0;
  const faltante = Math.max(0, totalNum - recibidoNum);

  return (
    <Modal onClose={onCerrar} ariaLabel="Calculadora de vuelto" className="w-full max-w-sm">
      <header className="flex items-center justify-between border-b border-border p-4">
        <h3 className="inline-flex items-center gap-2 font-display text-lg font-semibold text-text">
          <Calculator size={18} className="text-text-muted" /> Calculadora de vuelto
        </h3>
        <button
          onClick={onCerrar}
          aria-label="Cerrar"
          className="grid h-9 w-9 place-items-center rounded-md border border-border hover:bg-surface-sunk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-500"
        >
          <X size={18} />
        </button>
      </header>

      <div className="space-y-3 p-4">
        <div>
          <label htmlFor="calc-total" className="mb-1 block text-sm font-medium text-text">
            Total a cobrar
          </label>
          <input
            id="calc-total"
            type="number"
            inputMode="decimal"
            min={0}
            value={totalStr}
            onChange={(e) => setTotalStr(e.target.value)}
            placeholder="0.00"
            className="num h-12 w-full rounded-md border border-border bg-surface-alt px-3 text-right text-xl font-semibold text-text focus:border-action-500 focus:outline-none focus:ring-2 focus:ring-action-500/40"
          />
        </div>

        <div>
          <label htmlFor="calc-recibido" className="mb-1 block text-sm font-medium text-text">
            Efectivo recibido
          </label>
          <input
            id="calc-recibido"
            type="number"
            inputMode="decimal"
            min={0}
            autoFocus
            value={recibidoStr}
            onChange={(e) => setRecibidoStr(e.target.value)}
            placeholder="0.00"
            className="num h-12 w-full rounded-md border border-border bg-surface-alt px-3 text-right text-xl font-semibold text-text focus:border-action-500 focus:outline-none focus:ring-2 focus:ring-action-500/40"
          />
        </div>

        {/* Montos rápidos */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setRecibidoStr(totalStr || '0')}
            className="rounded-md border border-border px-3 py-2 text-sm font-medium text-text hover:bg-surface-sunk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-500"
          >
            Exacto
          </button>
          {DENOMINACIONES.filter((d) => d >= totalNum).map((d) => (
            <button
              key={d}
              onClick={() => setRecibidoStr(String(d))}
              className="num rounded-md border border-border px-3 py-2 text-sm font-medium text-text hover:bg-surface-sunk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-500"
            >
              {formatCurrency(d)}
            </button>
          ))}
        </div>

        {/* Resultado */}
        <div
          className={cn(
            'flex items-center justify-between rounded-lg px-4 py-3',
            suficiente ? 'bg-success/12' : 'bg-surface-alt',
          )}
        >
          <span className="text-sm font-medium text-text-muted">
            {suficiente || recibidoNum === 0 ? 'Vuelto' : `Faltan ${formatCurrency(faltante)}`}
          </span>
          <span className={cn('num text-2xl font-bold', suficiente ? 'text-success' : 'text-text-muted')}>
            {formatCurrency(Math.max(0, vuelto))}
          </span>
        </div>
      </div>

      <footer className="border-t border-border p-4">
        <Button size="lg" className="w-full" onClick={onCerrar}>
          Listo
        </Button>
      </footer>
    </Modal>
  );
}
