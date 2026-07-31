import { Wallet, Receipt, Repeat, Utensils, Store, ShoppingBag, Star, Gift } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { UtilidadNetaCard } from './UtilidadNetaCard';
import { SoloAdmin } from '@/lib/auth';
import { formatCurrency } from '@/lib/format';
import { type TipoVenta } from '@/lib/operacion';
import { useDashboard } from '@/lib/dashboard';
import { useInsumos } from '@/lib/inventario';
import { useMesas } from '@/lib/mesas';

const tipoVentaBadge: Record<TipoVenta, { label: string; icon: typeof Utensils }> = {
  mesa: { label: 'Mesa', icon: Utensils },
  mostrador: { label: 'Mostrador', icon: Store },
  llevar: { label: 'Para llevar', icon: ShoppingBag },
};

export function DashboardPage() {
  const { data: mesas = [] } = useMesas();
  const { data: dash } = useDashboard();
  const { data: insumos = [] } = useInsumos();

  // Resumen de fidelización (backend): puntos del día y saldos de clientes.
  const puntosOtorgados = dash?.lealtad.puntosOtorgados ?? 0;
  const puntosCanjeados = dash?.lealtad.puntosCanjeados ?? 0;
  const canjes = dash?.lealtad.canjes ?? 0;
  const clientesConPuntos = dash?.lealtad.clientesConPuntos ?? 0;
  const puntosEnCirculacion = dash?.lealtad.puntosEnCirculacion ?? 0;
  const totalClientes = dash?.lealtad.totalClientes ?? 0;

  // KPIs del día (backend). Últimas ventas y más vendidos también reales.
  const ventasHoy = dash?.ventasHoy ?? 0;
  const ventasAyer = dash?.ventasAyer ?? 0;
  const transacciones = dash?.transacciones ?? 0;
  const ticketPromedio = dash?.ticketPromedio ?? 0;
  const ultimasVentas = dash?.ultimasVentas ?? [];
  const topProductos = dash?.topProductos ?? [];
  const ventasPorHora = dash?.ventasPorHora ?? [];

  const mesasOcupadas = mesas.filter((m) => m.estado === 'ocupada' || m.estado === 'cuenta').length;
  const mesasTotales = mesas.length;

  const delta = ventasHoy - ventasAyer;
  const deltaPct = ventasAyer > 0 ? ((delta / ventasAyer) * 100).toFixed(1) : '—';
  const maxHora = ventasPorHora.reduce((m, v) => Math.max(m, v.monto), 0);

  // Alertas de stock derivadas del inventario real (insumos por debajo del mínimo).
  const alertasStock = insumos
    .filter((i) => i.nivel !== 'ok')
    .map((i) => ({
      insumo: i.nombre,
      restante: `${i.existencia} ${i.unidad}`,
      minimo: `${i.minimo} ${i.unidad}`,
      nivel: i.nivel,
    }));

  return (
    <div className="space-y-4 p-3 sm:space-y-6 sm:p-6">
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl font-semibold text-text sm:text-3xl">Resumen del día</h1>
          <p className="text-sm text-text-muted">
            {new Date().toLocaleDateString('es-GT', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-success/12 px-3 py-1 text-xs font-semibold text-success">
          <span className="h-2 w-2 animate-pulse rounded-full bg-success" /> En vivo
        </span>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Ventas de hoy"
          value={formatCurrency(ventasHoy)}
          icon={Wallet}
          iconTone="action"
          trend={{ value: deltaPct === '—' ? 'sin datos de ayer' : `${deltaPct}% vs. ayer`, positive: delta >= 0 }}
        />
        <StatCard label="Ticket promedio" value={formatCurrency(ticketPromedio)} icon={Receipt} hint="por venta" />
        <StatCard
          label="Transacciones"
          value={String(transacciones)}
          icon={Repeat}
          iconTone="info"
          hint="ventas de hoy"
        />
        <StatCard
          label="Mesas ocupadas"
          value={`${mesasOcupadas}/${mesasTotales}`}
          icon={Utensils}
          iconTone="accent"
          hint={`${mesasTotales > 0 ? Math.round((mesasOcupadas / mesasTotales) * 100) : 0}% de ocupación`}
        />
      </div>

      {/* Utilidad neta del día — solo administradores (contiene costos y márgenes) */}
      <SoloAdmin>
        <UtilidadNetaCard ventasHoy={ventasHoy} />
      </SoloAdmin>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Ventas por hora */}
        <Card className="p-3 sm:p-4 lg:col-span-2">
          <h2 className="font-display text-lg font-semibold text-text">Ventas por hora</h2>
          {ventasPorHora.length === 0 ? (
            <div className="mt-4 flex h-40 items-center justify-center text-sm text-text-muted sm:h-48">
              Aún no hay ventas hoy.
            </div>
          ) : (
            <div className="mt-4 flex h-40 items-end gap-1 sm:h-48 sm:gap-2">
              {ventasPorHora.map((v) => (
                <div key={v.hora} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-sm bg-action-500 transition-all"
                    style={{ height: `${(v.monto / (maxHora || 1)) * 100}%` }}
                    title={formatCurrency(v.monto)}
                  />
                  <span className="num text-xs text-text-muted">{v.hora}h</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Alertas de stock */}
        <Card className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-text">Alertas de stock</h2>
            <Badge tone="danger">{alertasStock.filter((a) => a.nivel === 'critico').length} críticas</Badge>
          </div>
          {alertasStock.length === 0 ? (
            <p className="mt-3 rounded-md bg-surface-alt px-3 py-6 text-center text-sm text-text-muted">
              Todo el inventario por encima del mínimo.
            </p>
          ) : (
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
          )}
        </Card>
      </div>

      {/* Últimas ventas (reales, desde el backend) */}
      <Card className="p-4">
        <h2 className="font-display text-lg font-semibold text-text">Últimas ventas</h2>
        {ultimasVentas.length === 0 ? (
          <div className="mt-3 rounded-md border border-dashed border-border p-6 text-center">
            <Receipt size={32} className="mx-auto text-text-muted" />
            <p className="mt-2 text-sm font-medium text-text">Aún no hay ventas</p>
            <p className="text-sm text-text-muted">Cobra un ticket en el Punto de venta y aparecerá aquí.</p>
          </div>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {ultimasVentas.slice(0, 6).map((v) => {
              const info = tipoVentaBadge[v.tipoVenta];
              const Icono = info.icon;
              return (
                <li key={v.id} className="flex items-center gap-3 py-2.5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-action-50 text-action-700">
                    <Icono size={16} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="num text-sm font-semibold text-text">{v.serie}-{v.folio}</span>
                      <Badge tone="neutral">{info.label}</Badge>
                    </div>
                    <div className="num text-xs text-text-muted">{v.hora}</div>
                  </div>
                  <span className="num text-sm font-semibold text-text">{formatCurrency(v.total)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

      {/* Fidelización */}
      <Card className="p-3 sm:p-4">
        <div className="flex items-center gap-2">
          <Gift size={18} className="text-brand-500" />
          <h2 className="font-display text-lg font-semibold text-text">Fidelización</h2>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MiniStat icon={Star} tono="accent" label="Puntos otorgados" valor={String(puntosOtorgados)} hint="hoy" />
          <MiniStat icon={Gift} tono="action" label="Puntos canjeados" valor={String(puntosCanjeados)} hint={`${canjes} canje${canjes === 1 ? '' : 's'} hoy`} />
          <MiniStat icon={Repeat} tono="brand" label="Clientes con puntos" valor={String(clientesConPuntos)} hint={`de ${totalClientes}`} />
          <MiniStat icon={Star} tono="info" label="Puntos en circulación" valor={String(puntosEnCirculacion)} hint="saldo total" />
        </div>
      </Card>

      {/* Top productos */}
      <Card className="p-3 sm:p-4">
        <h2 className="font-display text-lg font-semibold text-text">Más vendidos hoy</h2>
        <div className="mt-3 overflow-x-auto scroll-thin">
          <table className="w-full min-w-[20rem] text-sm">
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
        </div>
      </Card>
    </div>
  );
}

function MiniStat({
  icon: Icon,
  tono,
  label,
  valor,
  hint,
}: {
  icon: typeof Star;
  tono: 'brand' | 'action' | 'info' | 'accent';
  label: string;
  valor: string;
  hint: string;
}) {
  const tonos: Record<string, string> = {
    brand: 'bg-brand-100 text-brand-700',
    action: 'bg-action-50 text-action-700',
    info: 'bg-info/12 text-info',
    accent: 'bg-accent-400/25 text-accent-600',
  };
  return (
    <div className="rounded-lg bg-surface-alt p-3">
      <span className={`grid h-8 w-8 place-items-center rounded-md ${tonos[tono]}`}>
        <Icon size={16} />
      </span>
      <p className="mt-2 text-xs text-text-muted">{label}</p>
      <p className="num text-xl font-semibold text-text">{valor}</p>
      <p className="text-xs text-text-muted">{hint}</p>
    </div>
  );
}
