import { FileDown, FileSpreadsheet, TrendingUp, TrendingDown, Scale } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/layout/PageHeader';
import { formatCurrency } from '@/lib/format';
import { useToast } from '@/lib/toast';
import { exportarCSV } from '@/lib/exportar';
import { cn } from '@/lib/cn';
import { ventasPorDia, ventasPorCategoria, rentabilidadProductos, gastosSeed } from '@/mock/data';

const barColors = ['bg-brand-500', 'bg-action-500', 'bg-accent-400', 'bg-info', 'bg-brand-300'];

/** Ingresos del mes (base coherente con el negocio para el estado de resultados). */
const INGRESOS_MES = 128_400;

export function ReportesPage() {
  const toast = useToast();
  const maxDia = Math.max(...ventasPorDia.map((v) => v.monto));
  const totalSemana = ventasPorDia.reduce((s, v) => s + v.monto, 0);

  // Rentabilidad del mes: ingresos − gastos (del módulo de Gastos) = utilidad.
  const gastosMes = gastosSeed.reduce((s, g) => s + g.monto, 0);
  const utilidad = INGRESOS_MES - gastosMes;
  const margenNeto = ((utilidad / INGRESOS_MES) * 100).toFixed(1);

  function exportarExcel() {
    exportarCSV(
      'rentabilidad-productos',
      ['Producto', 'Vendidos', 'Ingreso', 'Costo', 'Margen %'],
      rentabilidadProductos.map((p) => [p.producto, p.vendidos, p.ingreso, p.costo, p.margen]),
    );
    toast.exito('Reporte exportado como CSV (compatible con Excel).');
  }

  function exportarPDF() {
    toast.info('Abriendo vista de impresión…');
    setTimeout(() => window.print(), 300);
  }

  return (
    <div className="space-y-5 p-4 sm:space-y-6 sm:p-6">
      <PageHeader
        title="Reportes"
        subtitle="Julio 2026"
        actions={
          <>
            <Button variant="secondary" onClick={exportarExcel}>
              <FileSpreadsheet size={18} /> Excel
            </Button>
            <Button variant="secondary" onClick={exportarPDF}>
              <FileDown size={18} /> PDF
            </Button>
          </>
        }
      />

      {/* Estado de resultados del mes: ingresos − gastos = utilidad */}
      <Card className="p-4">
        <h2 className="font-display text-lg font-semibold text-text">Rentabilidad del mes</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <ResultadoTile
            icon={TrendingUp}
            tono="success"
            label="Ingresos"
            valor={formatCurrency(INGRESOS_MES)}
            hint="ventas totales"
          />
          <ResultadoTile
            icon={TrendingDown}
            tono="danger"
            label="Gastos"
            valor={formatCurrency(gastosMes)}
            hint={`${gastosSeed.length} egresos`}
          />
          <ResultadoTile
            icon={Scale}
            tono="action"
            label="Utilidad neta"
            valor={formatCurrency(utilidad)}
            hint={`margen ${margenNeto}%`}
            destacado
          />
        </div>

        {/* Barra visual ingresos vs gastos */}
        <div className="mt-4">
          <div className="flex h-3 overflow-hidden rounded-full bg-surface-sunk">
            <div className="bg-success" style={{ width: `${(utilidad / INGRESOS_MES) * 100}%` }} title="Utilidad" />
            <div className="bg-danger" style={{ width: `${(gastosMes / INGRESOS_MES) * 100}%` }} title="Gastos" />
          </div>
          <div className="mt-2 flex flex-wrap gap-4 text-xs text-text-muted">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-success" /> Utilidad {margenNeto}%
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-danger" /> Gastos {((gastosMes / INGRESOS_MES) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </Card>

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

function ResultadoTile({
  icon: Icon,
  tono,
  label,
  valor,
  hint,
  destacado,
}: {
  icon: typeof TrendingUp;
  tono: 'success' | 'danger' | 'action';
  label: string;
  valor: string;
  hint: string;
  destacado?: boolean;
}) {
  const tonos: Record<string, string> = {
    success: 'bg-success/15 text-success',
    danger: 'bg-danger/12 text-danger',
    action: 'bg-action-50 text-action-700',
  };
  return (
    <div className={cn('rounded-lg border p-4', destacado ? 'border-action-500 bg-action-50/40' : 'border-border bg-surface-alt')}>
      <div className="flex items-center gap-2">
        <span className={cn('grid h-8 w-8 place-items-center rounded-md', tonos[tono])}>
          <Icon size={16} />
        </span>
        <span className="text-sm font-medium text-text-muted">{label}</span>
      </div>
      <div className="num mt-2 text-2xl font-semibold text-text">{valor}</div>
      <div className="text-xs text-text-muted">{hint}</div>
    </div>
  );
}
