import { useMemo, useState } from 'react';
import {
  Search,
  Plus,
  ClipboardList,
  PackageX,
  Package,
  AlertTriangle,
  DollarSign,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { PageHeader } from '@/components/layout/PageHeader';
import { cn } from '@/lib/cn';
import { formatCurrency } from '@/lib/format';
import { useOperacion } from '@/lib/operacion';
import { kardexEjemplo, type NivelStock } from '@/mock/data';

const nivelBadge: Record<NivelStock, { label: string; tone: 'success' | 'warning' | 'danger' }> = {
  ok: { label: 'En nivel', tone: 'success' },
  bajo: { label: 'Bajo', tone: 'warning' },
  critico: { label: 'Crítico', tone: 'danger' },
};

export function InventarioPage() {
  const { insumos } = useOperacion();
  const [q, setQ] = useState('');
  const [seleccionado, setSeleccionado] = useState(insumos[0]?.id ?? '');

  const filtrados = useMemo(() => {
    const t = q.trim().toLowerCase();
    return insumos.filter((i) => !t || i.nombre.toLowerCase().includes(t) || i.categoria.toLowerCase().includes(t));
  }, [q]);

  const valorTotal = insumos.reduce((s, i) => s + i.existencia * i.costoUnitario, 0);
  const criticos = insumos.filter((i) => i.nivel === 'critico').length;
  const bajos = insumos.filter((i) => i.nivel === 'bajo').length;

  return (
    <div className="space-y-5 p-4 sm:space-y-6 sm:p-6">
      <PageHeader
        title="Inventario"
        subtitle={`${insumos.length} insumos registrados`}
        actions={
          <>
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
                      seleccionado === i.id && 'bg-action-50',
                    )}
                  >
                    <td className="p-3">
                      <div className="font-medium text-text">{i.nombre}</div>
                      <div className="text-xs text-text-muted">{i.categoria}</div>
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
        </Card>

        {/* Kardex del insumo seleccionado */}
        <Card className="p-4">
          <h2 className="font-display text-lg font-semibold text-text">Kardex</h2>
          <p className="text-xs text-text-muted">
            {insumos.find((i) => i.id === seleccionado)?.nombre ?? '—'} · movimientos recientes
          </p>
          <ul className="mt-3 space-y-2">
            {kardexEjemplo.map((m, idx) => (
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
        </Card>
      </div>
    </div>
  );
}
