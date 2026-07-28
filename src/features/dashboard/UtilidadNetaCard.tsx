import { useState } from 'react';
import { TrendingUp, TrendingDown, SlidersHorizontal } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/cn';
import { useCostosOperativos, calcularUtilidad, type CostosOperativos } from '@/lib/costos';

/** Tarjeta de utilidad neta del día, con desglose y ajustes editables. */
export function UtilidadNetaCard({ ventasHoy }: { ventasHoy: number }) {
  const { costos, guardar } = useCostosOperativos();
  const [editar, setEditar] = useState(false);
  const { produccion, operativosDia, mantenimiento, utilidad, margen } = calcularUtilidad(ventasHoy, costos);
  const positivo = utilidad >= 0;

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-text">Utilidad neta del día</h2>
          <p className="text-sm text-text-muted">Venta menos producción, gastos operativos y reserva.</p>
        </div>
        <Button size="sm" variant="secondary" onClick={() => setEditar(true)}>
          <SlidersHorizontal size={16} /> Ajustes
        </Button>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,16rem)_1fr] lg:items-center">
        {/* Cifra principal */}
        <div className="rounded-lg bg-surface-alt p-4">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'grid h-9 w-9 place-items-center rounded-md',
                positivo ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger',
              )}
            >
              {positivo ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
            </span>
            <span className="text-sm font-medium text-text-muted">Utilidad neta</span>
          </div>
          <p className={cn('num mt-2 text-3xl font-bold', positivo ? 'text-success' : 'text-danger')}>
            {formatCurrency(utilidad)}
          </p>
          <p className="num mt-1 text-sm text-text-muted">
            Margen {margen.toFixed(1)}% · sobre {formatCurrency(ventasHoy)} de venta
          </p>
        </div>

        {/* Desglose */}
        <dl className="space-y-1.5 text-sm">
          <Fila etiqueta="Venta del día" valor={ventasHoy} signo="+" />
          <Fila
            etiqueta={`Producción (${costos.costoProduccionPct}%)`}
            valor={produccion}
            signo="−"
            hint="Costo de insumos (food cost)"
          />
          <Fila etiqueta="Gastos operativos del día" valor={operativosDia} signo="−" hint="Renta + energía + personal ÷ 30" />
          <Fila
            etiqueta={`Reserva mantenimiento (${costos.mantenimientoPct}%)`}
            valor={mantenimiento}
            signo="−"
            hint="Reparación / reemplazo de máquinas"
          />
          <div className="mt-1 flex items-center justify-between border-t border-border pt-2">
            <dt className="font-semibold text-text">Utilidad neta</dt>
            <dd className={cn('num text-lg font-bold', positivo ? 'text-success' : 'text-danger')}>
              {formatCurrency(utilidad)}
            </dd>
          </div>
        </dl>
      </div>

      {editar && (
        <AjustesModal costos={costos} onGuardar={(c) => { guardar(c); setEditar(false); }} onCerrar={() => setEditar(false)} />
      )}
    </Card>
  );
}

function Fila({ etiqueta, valor, signo, hint }: { etiqueta: string; valor: number; signo: '+' | '−'; hint?: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-text-muted">
        {etiqueta}
        {hint && <span className="ml-1 hidden text-xs text-text-muted/70 sm:inline">· {hint}</span>}
      </dt>
      <dd className={cn('num shrink-0 tabular-nums', signo === '−' ? 'text-text-muted' : 'text-text')}>
        {signo} {formatCurrency(valor)}
      </dd>
    </div>
  );
}

const CAMPOS: { key: keyof CostosOperativos; label: string; sufijo: string }[] = [
  { key: 'personalMensual', label: 'Personal (planilla mensual)', sufijo: 'Q/mes' },
  { key: 'rentaMensual', label: 'Renta mensual', sufijo: 'Q/mes' },
  { key: 'energiaMensual', label: 'Energía eléctrica mensual', sufijo: 'Q/mes' },
  { key: 'costoProduccionPct', label: 'Costo de producción', sufijo: '% de venta' },
  { key: 'mantenimientoPct', label: 'Reserva mantenimiento', sufijo: '% de venta' },
];

function AjustesModal({
  costos,
  onGuardar,
  onCerrar,
}: {
  costos: CostosOperativos;
  onGuardar: (c: CostosOperativos) => void;
  onCerrar: () => void;
}) {
  const [draft, setDraft] = useState<CostosOperativos>(costos);

  return (
    <Modal onClose={onCerrar} ariaLabel="Ajustes de costos" className="w-full max-w-md">
      <header className="border-b border-border p-4">
        <h3 className="font-display text-lg font-semibold text-text">Ajustes de costos</h3>
        <p className="text-sm text-text-muted">Se usan para calcular la utilidad neta. Se guardan en este dispositivo.</p>
      </header>

      <div className="space-y-3 p-4">
        {CAMPOS.map((campo) => (
          <div key={campo.key}>
            <label htmlFor={campo.key} className="mb-1 block text-sm font-medium text-text">
              {campo.label}
            </label>
            <div className="relative">
              <input
                id={campo.key}
                type="number"
                inputMode="decimal"
                min={0}
                value={draft[campo.key]}
                onChange={(e) => setDraft((d) => ({ ...d, [campo.key]: parseFloat(e.target.value) || 0 }))}
                className="num h-11 w-full rounded-md border border-border bg-surface-alt px-3 pr-20 text-right text-base font-semibold text-text focus:border-action-500 focus:outline-none focus:ring-2 focus:ring-action-500/40"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted">
                {campo.sufijo}
              </span>
            </div>
          </div>
        ))}
      </div>

      <footer className="grid grid-cols-2 gap-2 border-t border-border p-4">
        <Button variant="secondary" size="lg" onClick={onCerrar}>
          Cancelar
        </Button>
        <Button size="lg" onClick={() => onGuardar(draft)}>
          Guardar
        </Button>
      </footer>
    </Modal>
  );
}
