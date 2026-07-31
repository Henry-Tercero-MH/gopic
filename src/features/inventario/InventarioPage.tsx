import { useMemo, useState } from 'react';
import {
  Search,
  Plus,
  ClipboardList,
  PackageX,
  Package,
  AlertTriangle,
  DollarSign,
  Repeat,
  X,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/layout/PageHeader';
import { useToast } from '@/lib/toast';
import { cn } from '@/lib/cn';
import { formatCurrency } from '@/lib/format';
import { useInsumos, useKardex, useReproceso } from '@/lib/inventario';
import { type InsumoApi } from '@/lib/api';

type Nivel = InsumoApi['nivel'];
type Tipo = InsumoApi['tipo'];

const nivelBadge: Record<Nivel, { label: string; tone: 'success' | 'warning' | 'danger' }> = {
  ok: { label: 'En nivel', tone: 'success' },
  bajo: { label: 'Bajo', tone: 'warning' },
  critico: { label: 'Crítico', tone: 'danger' },
};

const tipoInfo: Record<Tipo, { label: string; tone: 'neutral' | 'info' | 'success' }> = {
  materia_prima: { label: 'Materia prima', tone: 'neutral' },
  elaborado: { label: 'Elaborado', tone: 'info' },
  terminado: { label: 'Terminado', tone: 'success' },
};

export function InventarioPage() {
  const { data: insumos = [], isLoading } = useInsumos();
  const repro = useReproceso();
  const toast = useToast();
  const [q, setQ] = useState('');
  const [seleccionado, setSeleccionado] = useState('');
  const [reprocesoAbierto, setReprocesoAbierto] = useState(false);

  const sel = seleccionado || insumos[0]?.id || '';
  const { data: kardex = [] } = useKardex(sel || null);

  async function reprocesar(origenId: string, consumo: number, destinoId: string, produccion: number) {
    try {
      await repro.mutateAsync({ origenId, consumo, destinoId, produccion });
      const origen = insumos.find((i) => i.id === origenId);
      const destino = insumos.find((i) => i.id === destinoId);
      toast.exito(`Reproceso: −${consumo} ${origen?.unidad} → +${produccion} ${destino?.unidad} de ${destino?.nombre}.`);
      setReprocesoAbierto(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo reprocesar.');
    }
  }

  const filtrados = useMemo(() => {
    const t = q.trim().toLowerCase();
    return insumos.filter((i) => !t || i.nombre.toLowerCase().includes(t) || (i.categoria ?? '').toLowerCase().includes(t));
  }, [insumos, q]);

  const valorTotal = insumos.reduce((s, i) => s + i.existencia * i.costoUnitario, 0);
  const criticos = insumos.filter((i) => i.nivel === 'critico').length;
  const bajos = insumos.filter((i) => i.nivel === 'bajo').length;
  const nombreSel = insumos.find((i) => i.id === sel)?.nombre ?? '—';

  return (
    <div className="space-y-5 p-4 sm:space-y-6 sm:p-6">
      <PageHeader
        title="Inventario"
        subtitle={`${insumos.length} insumos registrados`}
        actions={
          <>
            <Button variant="secondary" onClick={() => setReprocesoAbierto(true)} disabled={insumos.length < 2}>
              <Repeat size={18} /> Reproceso
            </Button>
            <Button variant="secondary">
              <ClipboardList size={18} /> Conteo físico
            </Button>
            <Button>
              <Plus size={18} /> Nuevo insumo
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Valor de inventario" value={formatCurrency(valorTotal)} icon={DollarSign} iconTone="action" />
        <StatCard label="Insumos críticos" value={String(criticos)} icon={AlertTriangle} iconTone="accent" hint="requieren compra" />
        <StatCard label="Nivel bajo" value={String(bajos)} icon={PackageX} hint="cerca del mínimo" />
        <StatCard label="Categorías" value={String(new Set(insumos.map((i) => i.categoria)).size)} icon={Package} iconTone="info" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Tabla de insumos */}
        <Card className="lg:col-span-2">
          <div className="border-b border-border p-3">
            <div className="relative">
              <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar insumo o categoría…"
                className="h-10 w-full rounded-md border border-border bg-surface-alt pl-10 pr-4 text-sm text-text placeholder:text-text-muted focus:outline-none"
              />
            </div>
          </div>
          {isLoading ? (
            <div className="grid place-items-center p-10 text-text-muted">
              <Loader2 size={24} className="animate-spin motion-reduce:animate-none" aria-label="Cargando" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-text-muted">
                    <th className="p-3 font-medium">Insumo</th>
                    <th className="p-3 text-right font-medium">Existencia</th>
                    <th className="p-3 text-right font-medium">Mínimo</th>
                    <th className="p-3 text-right font-medium">Costo unit.</th>
                    <th className="p-3 text-center font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filtrados.map((i) => (
                    <tr
                      key={i.id}
                      onClick={() => setSeleccionado(i.id)}
                      className={cn(
                        'cursor-pointer border-b border-border/60 last:border-0 hover:bg-surface-alt',
                        sel === i.id && 'bg-action-50',
                      )}
                    >
                      <td className="p-3">
                        <div className="font-medium text-text">{i.nombre}</div>
                        <div className="mt-0.5 flex items-center gap-1.5">
                          <Badge tone={tipoInfo[i.tipo].tone}>{tipoInfo[i.tipo].label}</Badge>
                          <span className="text-xs text-text-muted">{i.categoria}</span>
                        </div>
                      </td>
                      <td className="num p-3 text-right font-semibold text-text">
                        {i.existencia} {i.unidad}
                      </td>
                      <td className="num p-3 text-right text-text-muted">
                        {i.minimo} {i.unidad}
                      </td>
                      <td className="num p-3 text-right text-text-muted">{formatCurrency(i.costoUnitario)}</td>
                      <td className="p-3 text-center">
                        <Badge tone={nivelBadge[i.nivel].tone}>{nivelBadge[i.nivel].label}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Kardex del insumo seleccionado */}
        <Card className="p-4">
          <h2 className="font-display text-lg font-semibold text-text">Kardex</h2>
          <p className="text-xs text-text-muted">{nombreSel} · movimientos recientes</p>
          {kardex.length === 0 ? (
            <p className="mt-4 rounded-md border border-dashed border-border p-6 text-center text-sm text-text-muted">
              Sin movimientos registrados.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {kardex.map((m, idx) => (
                <li key={idx} className="flex items-center justify-between rounded-md bg-surface-alt px-3 py-2">
                  <div>
                    <div className="text-sm font-medium text-text">{m.tipo}</div>
                    <div className="num text-xs text-text-muted">
                      {m.fecha} · {m.documento}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn('num text-sm font-semibold', m.cantidad >= 0 ? 'text-success' : 'text-danger')}>
                      {m.cantidad >= 0 ? '+' : ''}
                      {m.cantidad}
                    </div>
                    <div className="num text-xs text-text-muted">saldo {m.saldo}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {reprocesoAbierto && (
        <ReprocesoModal insumos={insumos} enviando={repro.isPending} onCerrar={() => setReprocesoAbierto(false)} onReprocesar={reprocesar} />
      )}
    </div>
  );
}

function ReprocesoModal({
  insumos,
  enviando,
  onCerrar,
  onReprocesar,
}: {
  insumos: InsumoApi[];
  enviando: boolean;
  onCerrar: () => void;
  onReprocesar: (origenId: string, consumo: number, destinoId: string, produccion: number) => void;
}) {
  const destinos = insumos.filter((i) => i.tipo !== 'materia_prima');
  const origenes = insumos.filter((i) => i.tipo === 'materia_prima');

  const [origenId, setOrigenId] = useState(origenes[0]?.id ?? insumos[0]?.id ?? '');
  const [destinoId, setDestinoId] = useState(destinos[0]?.id ?? insumos.find((i) => i.id !== origenId)?.id ?? '');
  const [consumoStr, setConsumoStr] = useState('');
  const [produccionStr, setProduccionStr] = useState('');

  const origen = insumos.find((i) => i.id === origenId);
  const destino = insumos.find((i) => i.id === destinoId);
  const consumo = parseFloat(consumoStr) || 0;
  const produccion = parseFloat(produccionStr) || 0;

  const excedeExistencia = !!origen && consumo > origen.existencia;
  const mismo = origenId === destinoId;
  const valido = origen && destino && consumo > 0 && produccion > 0 && !excedeExistencia && !mismo;

  const selectCls =
    'mt-1 h-11 w-full rounded-md border border-border bg-surface-alt px-3 text-sm text-text focus:border-action-500 focus:outline-none focus:ring-2 focus:ring-action-500/40';
  const inputCls =
    'num mt-1 h-11 w-full rounded-md border border-border bg-surface-alt px-3 text-right text-base font-semibold text-text focus:border-action-500 focus:outline-none focus:ring-2 focus:ring-action-500/40';

  return (
    <Modal onClose={onCerrar} ariaLabel="Reproceso de inventario" className="w-full max-w-md">
      <header className="flex items-center justify-between border-b border-border p-4">
        <div>
          <h3 className="inline-flex items-center gap-2 font-display text-lg font-semibold text-text">
            <Repeat size={18} className="text-text-muted" /> Reproceso
          </h3>
          <p className="text-sm text-text-muted">Convierte un insumo en su derivado (p. ej. granel → bolsas).</p>
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
        <div>
          <label htmlFor="rp-origen" className="text-sm font-medium text-text">Sale del inventario</label>
          <select id="rp-origen" value={origenId} onChange={(e) => setOrigenId(e.target.value)} className={selectCls}>
            {insumos.map((i) => (
              <option key={i.id} value={i.id}>
                {i.nombre} · {i.existencia} {i.unidad}
              </option>
            ))}
          </select>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            value={consumoStr}
            onChange={(e) => setConsumoStr(e.target.value)}
            placeholder={`Cantidad a consumir${origen ? ` (${origen.unidad})` : ''}`}
            className={inputCls}
          />
          {excedeExistencia && (
            <p className="mt-1 text-xs font-medium text-danger">
              Solo hay {origen?.existencia} {origen?.unidad} disponibles.
            </p>
          )}
        </div>

        <div className="flex justify-center">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-surface-sunk text-text-muted">
            <ArrowRight size={16} className="rotate-90" />
          </span>
        </div>

        <div>
          <label htmlFor="rp-destino" className="text-sm font-medium text-text">Entra al inventario</label>
          <select id="rp-destino" value={destinoId} onChange={(e) => setDestinoId(e.target.value)} className={selectCls}>
            {insumos.filter((i) => i.id !== origenId).map((i) => (
              <option key={i.id} value={i.id}>
                {i.nombre} · {tipoInfo[i.tipo].label}
              </option>
            ))}
          </select>
          <input
            type="number"
            inputMode="decimal"
            min={0}
            value={produccionStr}
            onChange={(e) => setProduccionStr(e.target.value)}
            placeholder={`Cantidad producida${destino ? ` (${destino.unidad})` : ''}`}
            className={inputCls}
          />
          {mismo && <p className="mt-1 text-xs font-medium text-danger">El origen y el destino deben ser distintos.</p>}
        </div>
      </div>

      <footer className="grid grid-cols-2 gap-2 border-t border-border p-4">
        <Button variant="secondary" size="lg" onClick={onCerrar}>Cancelar</Button>
        <Button size="lg" disabled={!valido || enviando} loading={enviando} onClick={() => onReprocesar(origenId, consumo, destinoId, produccion)}>
          <Repeat size={18} /> Reprocesar
        </Button>
      </footer>
    </Modal>
  );
}
