import { FileDown, FileSpreadsheet } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/layout/PageHeader';
import { formatCurrency } from '@/lib/format';
import { ventasPorDia, ventasPorCategoria, rentabilidadProductos } from '@/mock/data';

const barColors = ['bg-brand-500', 'bg-action-500', 'bg-accent-400', 'bg-info', 'bg-brand-300'];

export function ReportesPage() {
  const maxDia = Math.max(...ventasPorDia.map((v) => v.monto));
  const totalSemana = ventasPorDia.reduce((s, v) => s + v.monto, 0);

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Reportes"
        subtitle="Semana del 17 al 23 de julio"
        actions={
          <>
            <Button variant="secondary">
              <FileSpreadsheet size={18} /> Excel
            </Button>
            <Button variant="secondary">
              <FileDown size={18} /> PDF
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Ventas por día */}
        <Card className="p-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-text">Ventas por día</h2>
            <span className="num text-sm font-semibold text-text">{formatCurrency(totalSemana)}</span>
          </div>
          <div className="mt-4 flex h-56 items-end gap-3">
            {ventasPorDia.map((v) => (
              <div key={v.dia} className="flex flex-1 flex-col items-center gap-2">
                <span className="num text-xs text-text-muted">{(v.monto / 1000).toFixed(1)}k</span>
                <div
                  className="w-full rounded-t-md bg-action-500 transition-all"
                  style={{ height: `${(v.monto / maxDia) * 100}%` }}
                  title={formatCurrency(v.monto)}
                />
                <span className="text-xs font-medium text-text-muted">{v.dia}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Ventas por categoría */}
        <Card className="p-4">
          <h2 className="font-display text-lg font-semibold text-text">Por categoría</h2>
          <ul className="mt-4 space-y-3">
            {ventasPorCategoria.map((c, i) => (
              <li key={c.categoria}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-text">{c.categoria}</span>
                  <span className="num text-text-muted">{formatCurrency(c.monto)}</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-sunk">
                  <div className={`h-full rounded-full ${barColors[i % barColors.length]}`} style={{ width: `${c.pct}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Rentabilidad por producto */}
      <Card className="p-4">
        <h2 className="font-display text-lg font-semibold text-text">Rentabilidad por producto</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-text-muted">
                <th className="pb-2 font-medium">Producto</th>
                <th className="pb-2 text-right font-medium">Vendidos</th>
                <th className="pb-2 text-right font-medium">Ingreso</th>
                <th className="pb-2 text-right font-medium">Costo</th>
                <th className="pb-2 text-right font-medium">Margen</th>
              </tr>
            </thead>
            <tbody>
              {rentabilidadProductos.map((p) => (
                <tr key={p.producto} className="border-b border-border/60 last:border-0">
                  <td className="py-2 font-medium text-text">{p.producto}</td>
                  <td className="num py-2 text-right text-text-muted">{p.vendidos}</td>
                  <td className="num py-2 text-right font-semibold text-text">{formatCurrency(p.ingreso)}</td>
                  <td className="num py-2 text-right text-text-muted">{formatCurrency(p.costo)}</td>
                  <td className="py-2 text-right">
                    <Badge tone={p.margen >= 70 ? 'success' : 'warning'}>{p.margen}%</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
