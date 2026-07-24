import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/format';
import { kpis, topProductos, alertasStock, ventasPorHora } from '@/mock/data';

export function DashboardPage() {
  const delta = kpis.ventasHoy - kpis.ventasAyer;
  const deltaPct = ((delta / kpis.ventasAyer) * 100).toFixed(1);
  const maxHora = Math.max(...ventasPorHora.map((v) => v.monto));

  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="font-display text-3xl font-semibold text-text">Resumen del día</h1>
        <p className="text-sm text-text-muted">
          {new Date().toLocaleDateString('es-GT', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Ventas de hoy"
          value={formatCurrency(kpis.ventasHoy)}
          icon="💰"
          trend={{ value: `${deltaPct}% vs. ayer`, positive: delta >= 0 }}
        />
        <StatCard label="Ticket promedio" value={formatCurrency(kpis.ticketPromedio)} icon="🧾" hint="por venta" />
        <StatCard label="Transacciones" value={String(kpis.transacciones)} icon="🔁" hint="cobros cerrados" />
        <StatCard
          label="Mesas ocupadas"
          value={`${kpis.mesasOcupadas}/${kpis.mesasTotales}`}
          icon="🍽️"
          hint={`${Math.round((kpis.mesasOcupadas / kpis.mesasTotales) * 100)}% de ocupación`}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Ventas por hora */}
        <Card className="p-4 lg:col-span-2">
          <h2 className="font-display text-lg font-semibold text-text">Ventas por hora</h2>
          <div className="mt-4 flex h-48 items-end gap-2">
            {ventasPorHora.map((v) => (
              <div key={v.hora} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t-sm bg-action-500 transition-all"
                  style={{ height: `${(v.monto / maxHora) * 100}%` }}
                  title={formatCurrency(v.monto)}
                />
                <span className="num text-xs text-text-muted">{v.hora}h</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Alertas de stock */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-text">Alertas de stock</h2>
            <Badge tone="danger">{alertasStock.filter((a) => a.nivel === 'critico').length} críticas</Badge>
          </div>
          <ul className="mt-3 space-y-2">
            {alertasStock.map((a) => (
              <li key={a.insumo} className="flex items-center justify-between rounded-md bg-surface-alt px-3 py-2">
                <div>
                  <div className="text-sm font-medium text-text">{a.insumo}</div>
                  <div className="num text-xs text-text-muted">
                    {a.restante} · mín. {a.minimo}
                  </div>
                </div>
                <Badge tone={a.nivel === 'critico' ? 'danger' : 'warning'}>
                  {a.nivel === 'critico' ? 'Crítico' : 'Bajo'}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Top productos */}
      <Card className="p-4">
        <h2 className="font-display text-lg font-semibold text-text">Más vendidos hoy</h2>
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-text-muted">
              <th className="pb-2 font-medium">Producto</th>
              <th className="pb-2 text-right font-medium">Unidades</th>
              <th className="pb-2 text-right font-medium">Ingreso</th>
            </tr>
          </thead>
          <tbody>
            {topProductos.map((p) => (
              <tr key={p.nombre} className="border-b border-border/60 last:border-0">
                <td className="py-2 font-medium text-text">{p.nombre}</td>
                <td className="num py-2 text-right text-text-muted">{p.unidades}</td>
                <td className="num py-2 text-right font-semibold text-text">{formatCurrency(p.ingreso)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
