import { FileDown, FileSpreadsheet, TrendingUp, TrendingDown, Scale, Trophy, Gift, Star } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/layout/PageHeader';
import { formatCurrency } from '@/lib/format';
import { useToast } from '@/lib/toast';
import { useReportes } from '@/lib/reportes';
import { exportarCSV } from '@/lib/exportar';
import { cn } from '@/lib/cn';

const barColors = ['bg-brand-500', 'bg-action-500', 'bg-accent-400', 'bg-info', 'bg-brand-300'];

export function ReportesPage() {
  const toast = useToast();
  const { data, isLoading } = useReportes();

  const ingresos = data?.ingresos ?? 0;
  const gastosMes = data?.gastos ?? 0;
  const ventasPorDia = data?.ventasPorDia ?? [];
  const ventasPorCategoria = data?.ventasPorCategoria ?? [];
  const rentabilidadProductos = data?.rentabilidadProductos ?? [];
  const gastosPorCategoria = data?.gastosPorCategoria ?? [];
  const topVendedores = data?.topVendedores ?? [];
  const puntosOtorgados = data?.fidelizacion.puntosOtorgados ?? 0;
  const puntosCanjeados = data?.fidelizacion.puntosCanjeados ?? 0;
  const recompensasCanjeadas = data?.fidelizacion.recompensasCanjeadas ?? [];
  const topClientes = data?.fidelizacion.topClientes ?? [];

  const maxDia = ventasPorDia.reduce((m, v) => Math.max(m, v.monto), 0);
  const totalSemana = ventasPorDia.reduce((s, v) => s + v.monto, 0);
  const utilidad = ingresos - gastosMes;
  const margenNeto = ingresos > 0 ? ((utilidad / ingresos) * 100).toFixed(1) : '0.0';
  const maxVendedor = topVendedores.reduce((m, v) => Math.max(m, v.monto), 0);
  const baseIngresos = ingresos || 1;

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

  function exportarGastos() {
    exportarCSV(
      'gastos-por-categoria',
      ['Categoría', 'Monto', '% del total'],
      gastosPorCategoria.map((g) => [g.categoria, g.monto, `${g.pct.toFixed(1)}%`]),
    );
    toast.exito('Gastos por categoría exportados como CSV.');
  }

  return (
    <div className="space-y-5 p-4 sm:space-y-6 sm:p-6">
      <PageHeader
        title="Reportes"
        subtitle={data?.periodo ?? (isLoading ? 'Cargando…' : '')}
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
            valor={formatCurrency(ingresos)}
            hint="ventas totales"
          />
          <ResultadoTile
            icon={TrendingDown}
            tono="danger"
            label="Gastos"
            valor={formatCurrency(gastosMes)}
            hint={`${gastosPorCategoria.length} categorías`}
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
            <div className="bg-success" style={{ width: `${(Math.max(utilidad, 0) / baseIngresos) * 100}%` }} title="Utilidad" />
            <div className="bg-danger" style={{ width: `${(gastosMes / baseIngresos) * 100}%` }} title="Gastos" />
          </div>
          <div className="mt-2 flex flex-wrap gap-4 text-xs text-text-muted">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-success" /> Utilidad {margenNeto}%
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-danger" /> Gastos {((gastosMes / baseIngresos) * 100).toFixed(1)}%
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

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Personal que más vendió en el turno */}
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-accent-600" />
            <h2 className="font-display text-lg font-semibold text-text">Más vendieron en el turno</h2>
          </div>
          <ul className="mt-4 space-y-3">
            {topVendedores.map((v, i) => (
              <li key={v.nombre} className="flex items-center gap-3">
                <span className="num w-4 shrink-0 text-center text-sm font-semibold text-text-muted">{i + 1}</span>
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                  {v.iniciales}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium text-text">{v.nombre}</span>
                    <span className="num shrink-0 text-sm font-semibold text-text">{formatCurrency(v.monto)}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-sunk">
                      <div className="h-full rounded-full bg-action-500" style={{ width: `${(v.monto / maxVendedor) * 100}%` }} />
                    </div>
                    <span className="num shrink-0 text-xs text-text-muted">{v.tickets} tickets</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        {/* Gastos del mes por categoría */}
        <Card className="p-4">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-lg font-semibold text-text">Gastos por categoría</h2>
            <div className="flex items-center gap-2">
              <span className="num text-sm font-semibold text-danger">{formatCurrency(gastosMes)}</span>
              <button
                onClick={exportarGastos}
                aria-label="Descargar gastos por categoría"
                title="Descargar CSV"
                className="grid h-8 w-8 place-items-center rounded-md border border-border text-text-muted hover:bg-surface-sunk hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-500"
              >
                <FileSpreadsheet size={16} />
              </button>
            </div>
          </div>
          <ul className="mt-4 space-y-3">
            {gastosPorCategoria.map((g, i) => (
              <li key={g.categoria}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-text">{g.categoria}</span>
                  <span className="num text-text-muted">
                    {formatCurrency(g.monto)} · {g.pct.toFixed(0)}%
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-sunk">
                  <div className={`h-full rounded-full ${barColors[i % barColors.length]}`} style={{ width: `${g.pct}%` }} />
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

      {/* Fidelización */}
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <Gift size={18} className="text-brand-500" />
          <h2 className="font-display text-lg font-semibold text-text">Fidelización</h2>
        </div>
        <div className="mt-3 grid gap-4 lg:grid-cols-3">
          {/* Resumen */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
            <div className="rounded-lg bg-surface-alt p-3">
              <p className="text-xs text-text-muted">Puntos otorgados</p>
              <p className="num inline-flex items-center gap-1 text-2xl font-semibold text-accent-600">
                <Star size={18} /> {puntosOtorgados}
              </p>
            </div>
            <div className="rounded-lg bg-surface-alt p-3">
              <p className="text-xs text-text-muted">Puntos canjeados</p>
              <p className="num text-2xl font-semibold text-action-700">{puntosCanjeados}</p>
            </div>
          </div>

          {/* Recompensas más canjeadas */}
          <div>
            <h3 className="text-sm font-semibold text-text">Recompensas más canjeadas</h3>
            {recompensasCanjeadas.length === 0 ? (
              <p className="mt-2 rounded-md bg-surface-alt px-3 py-2 text-xs text-text-muted">
                Aún no hay canjes registrados en esta sesión.
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {recompensasCanjeadas.map((r) => (
                  <li key={r.nombre} className="flex items-center justify-between rounded-md bg-surface-alt px-3 py-2 text-sm">
                    <span className="font-medium text-text">{r.nombre}</span>
                    <Badge tone="accent">{r.veces}×</Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Top clientes por puntos */}
          <div>
            <h3 className="text-sm font-semibold text-text">Clientes con más puntos</h3>
            {topClientes.length === 0 ? (
              <p className="mt-2 rounded-md bg-surface-alt px-3 py-2 text-xs text-text-muted">
                Sin clientes con puntos todavía.
              </p>
            ) : (
              <ul className="mt-2 space-y-2">
                {topClientes.map((c, i) => (
                  <li key={c.nombre + i} className="flex items-center gap-3">
                    <span className="num w-4 shrink-0 text-center text-sm font-semibold text-text-muted">{i + 1}</span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-text">{c.nombre}</span>
                    <span className="num inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-accent-600">
                      <Star size={13} /> {c.puntos}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
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
