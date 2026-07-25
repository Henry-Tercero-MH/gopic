import { useMemo, useState } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Wallet,
  CheckCircle2,
  Clock,
  TrendingDown,
  X,
  Check,
  type LucideIcon,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { PageHeader } from '@/components/layout/PageHeader';
import { useToast } from '@/lib/toast';
import { cn } from '@/lib/cn';
import { formatCurrency } from '@/lib/format';
import {
  gastosSeed,
  categoriasGasto,
  type Gasto,
  type CategoriaGasto,
  type EstadoGasto,
  type MetodoGasto,
} from '@/mock/data';

const METODOS: MetodoGasto[] = ['Efectivo', 'Transferencia', 'Tarjeta'];

const estadoConfig: Record<EstadoGasto, { label: string; tone: 'success' | 'warning' }> = {
  pagado: { label: 'Pagado', tone: 'success' },
  pendiente: { label: 'Pendiente', tone: 'warning' },
};

const barColors = ['bg-brand-500', 'bg-action-500', 'bg-accent-400', 'bg-info', 'bg-brand-300', 'bg-action-600'];

export function GastosPage() {
  const [gastos, setGastos] = useState<Gasto[]>(gastosSeed);
  const [busqueda, setBusqueda] = useState('');
  const [filtroCat, setFiltroCat] = useState<CategoriaGasto | 'todas'>('todas');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<Gasto | null>(null);
  const toast = useToast();
  const confirm = useConfirm();

  const total = gastos.reduce((s, g) => s + g.monto, 0);
  const pagado = gastos.filter((g) => g.estado === 'pagado').reduce((s, g) => s + g.monto, 0);
  const pendiente = total - pagado;

  // Desglose por categoría (ordenado de mayor a menor).
  const porCategoria = useMemo(() => {
    const mapa = new Map<CategoriaGasto, number>();
    for (const g of gastos) mapa.set(g.categoria, (mapa.get(g.categoria) ?? 0) + g.monto);
    return [...mapa.entries()].sort((a, b) => b[1] - a[1]);
  }, [gastos]);

  const categoriaMayor = porCategoria[0]?.[0] ?? '—';

  const q = busqueda.trim().toLowerCase();
  const visibles = gastos.filter((g) => {
    const okCat = filtroCat === 'todas' || g.categoria === filtroCat;
    const okQ = !q || g.concepto.toLowerCase().includes(q) || g.proveedor.toLowerCase().includes(q);
    return okCat && okQ;
  });

  function marcarPagado(g: Gasto) {
    setGastos((prev) => prev.map((x) => (x.id === g.id ? { ...x, estado: 'pagado' } : x)));
    toast.exito(`"${g.concepto}" marcado como pagado.`);
  }

  function guardar(gasto: Gasto) {
    const esNuevo = !gastos.some((x) => x.id === gasto.id);
    setGastos((prev) => (esNuevo ? [gasto, ...prev] : prev.map((x) => (x.id === gasto.id ? gasto : x))));
    setModalAbierto(false);
    toast.exito(esNuevo ? `Gasto "${gasto.concepto}" registrado.` : `Gasto "${gasto.concepto}" actualizado.`);
  }

  async function eliminar(g: Gasto) {
    const ok = await confirm({
      titulo: 'Eliminar gasto',
      mensaje: `¿Eliminar "${g.concepto}" (${formatCurrency(g.monto)})? Esta acción no se puede deshacer.`,
      confirmar: 'Eliminar',
      peligro: true,
    });
    if (!ok) return;
    setGastos((prev) => prev.filter((x) => x.id !== g.id));
    toast.info(`Gasto "${g.concepto}" eliminado.`);
  }

  return (
    <div className="space-y-5 p-4 sm:space-y-6 sm:p-6">
      <PageHeader
        title="Gastos"
        subtitle="Egresos operativos del mes"
        actions={
          <Button onClick={() => { setEditando(null); setModalAbierto(true); }}>
            <Plus size={18} /> Registrar gasto
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi icon={TrendingDown} label="Total de gastos" valor={formatCurrency(total)} tono="brand" />
        <Kpi icon={CheckCircle2} label="Pagado" valor={formatCurrency(pagado)} tono="success" />
        <Kpi icon={Clock} label="Pendiente" valor={formatCurrency(pendiente)} tono="accent" />
        <Kpi icon={Wallet} label="Mayor categoría" valor={categoriaMayor} tono="info" chico />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Desglose por categoría */}
        <Card className="p-4">
          <h2 className="font-display text-lg font-semibold text-text">Por categoría</h2>
          <ul className="mt-4 space-y-3">
            {porCategoria.map(([cat, monto], i) => (
              <li key={cat}>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-text">{cat}</span>
                  <span className="num text-text-muted">{formatCurrency(monto)}</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-sunk">
                  <div
                    className={cn('h-full rounded-full', barColors[i % barColors.length])}
                    style={{ width: `${(monto / (porCategoria[0]?.[1] || 1)) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Card>

        {/* Tabla de gastos */}
        <Card className="overflow-hidden lg:col-span-2">
          <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
            <div className="relative min-w-[12rem] flex-1">
              <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar concepto o proveedor…"
                className="h-10 w-full rounded-md border border-border bg-surface-alt pl-10 pr-4 text-sm text-text placeholder:text-text-muted focus:border-action-500 focus:outline-none"
              />
            </div>
            <select
              value={filtroCat}
              onChange={(e) => setFiltroCat(e.target.value as CategoriaGasto | 'todas')}
              className="h-10 rounded-md border border-border bg-surface-alt px-3 text-sm text-text focus:border-action-500 focus:outline-none"
            >
              <option value="todas">Todas las categorías</option>
              {categoriasGasto.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {visibles.length === 0 ? (
            <p className="p-8 text-center text-sm text-text-muted">Sin gastos que coincidan.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-text-muted">
                    <th className="px-4 py-2.5 font-semibold">Fecha</th>
                    <th className="px-4 py-2.5 font-semibold">Concepto</th>
                    <th className="px-4 py-2.5 font-semibold">Categoría</th>
                    <th className="px-4 py-2.5 text-right font-semibold">Monto</th>
                    <th className="px-4 py-2.5 font-semibold">Estado</th>
                    <th className="px-4 py-2.5 text-right font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {visibles.map((g) => (
                    <tr key={g.id} className="border-b border-border last:border-0 hover:bg-surface-alt">
                      <td className="num px-4 py-3 text-text-muted">{g.fecha}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-text">{g.concepto}</div>
                        <div className="text-xs text-text-muted">{g.proveedor} · {g.metodo}</div>
                      </td>
                      <td className="px-4 py-3 text-text-muted">{g.categoria}</td>
                      <td className="num px-4 py-3 text-right font-semibold text-text">{formatCurrency(g.monto)}</td>
                      <td className="px-4 py-3">
                        <Badge tone={estadoConfig[g.estado].tone}>{estadoConfig[g.estado].label}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1.5">
                          {g.estado === 'pendiente' && (
                            <Button size="sm" onClick={() => marcarPagado(g)}>
                              <Check size={15} /> Pagar
                            </Button>
                          )}
                          <button
                            onClick={() => { setEditando(g); setModalAbierto(true); }}
                            aria-label={`Editar ${g.concepto}`}
                            className="grid h-8 w-8 place-items-center rounded-md border border-border text-text-muted hover:bg-surface-sunk hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-500"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => eliminar(g)}
                            aria-label={`Eliminar ${g.concepto}`}
                            className="grid h-8 w-8 place-items-center rounded-md border border-border text-danger hover:bg-danger/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {modalAbierto && (
        <GastoModal gasto={editando} onCerrar={() => setModalAbierto(false)} onGuardar={guardar} />
      )}
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  valor,
  tono,
  chico,
}: {
  icon: LucideIcon;
  label: string;
  valor: string;
  tono: 'brand' | 'success' | 'info' | 'accent';
  chico?: boolean;
}) {
  const tonos: Record<string, string> = {
    brand: 'bg-brand-100 text-brand-700',
    success: 'bg-success/15 text-success',
    info: 'bg-info/12 text-info',
    accent: 'bg-accent-400/25 text-accent-600',
  };
  return (
    <Card className="p-4">
      <span className={cn('grid h-9 w-9 place-items-center rounded-md', tonos[tono])}>
        <Icon size={18} />
      </span>
      <p className="mt-3 text-sm text-text-muted">{label}</p>
      <p className={cn('mt-0.5 font-semibold text-text', chico ? 'text-lg' : 'num text-2xl')}>{valor}</p>
    </Card>
  );
}

function GastoModal({
  gasto,
  onCerrar,
  onGuardar,
}: {
  gasto: Gasto | null;
  onCerrar: () => void;
  onGuardar: (g: Gasto) => void;
}) {
  const [concepto, setConcepto] = useState(gasto?.concepto ?? '');
  const [categoria, setCategoria] = useState<CategoriaGasto>(gasto?.categoria ?? 'Servicios');
  const [proveedor, setProveedor] = useState(gasto?.proveedor ?? '');
  const [metodo, setMetodo] = useState<MetodoGasto>(gasto?.metodo ?? 'Transferencia');
  const [estado, setEstado] = useState<EstadoGasto>(gasto?.estado ?? 'pagado');
  const [monto, setMonto] = useState(gasto ? String(gasto.monto) : '');

  const montoNum = parseFloat(monto) || 0;
  const valido = concepto.trim() !== '' && montoNum > 0;

  const inputCls =
    'mt-1 h-10 w-full rounded-md border border-border bg-surface-alt px-3 text-sm text-text focus:border-action-500 focus:outline-none';

  function guardar() {
    onGuardar({
      id: gasto?.id ?? `g-${Date.now()}`,
      fecha: gasto?.fecha ?? new Date().toLocaleDateString('es-GT'),
      concepto: concepto.trim(),
      categoria,
      proveedor: proveedor.trim() || '—',
      metodo,
      estado,
      monto: montoNum,
    });
  }

  return (
    <Modal onClose={onCerrar} ariaLabel={gasto ? 'Editar gasto' : 'Registrar gasto'} className="w-full max-w-md">
      <header className="flex items-center justify-between border-b border-border p-4">
        <h3 className="font-display text-lg font-semibold text-text">{gasto ? 'Editar gasto' : 'Registrar gasto'}</h3>
        <button
          onClick={onCerrar}
          aria-label="Cerrar"
          className="grid h-9 w-9 place-items-center rounded-md border border-border hover:bg-surface-sunk"
        >
          <X size={18} />
        </button>
      </header>

      <div className="space-y-4 p-4">
        <label className="block">
          <span className="text-sm font-medium text-text">Concepto</span>
          <input value={concepto} onChange={(e) => setConcepto(e.target.value)} placeholder="Renta, energía eléctrica…" autoFocus className={inputCls} />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm font-medium text-text">Categoría</span>
            <select value={categoria} onChange={(e) => setCategoria(e.target.value as CategoriaGasto)} className={inputCls}>
              {categoriasGasto.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-text">Monto (Q)</span>
            <input type="number" min={0} step="0.01" value={monto} onChange={(e) => setMonto(e.target.value)} className={cn(inputCls, 'num')} />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-text">Proveedor / beneficiario</span>
          <input value={proveedor} onChange={(e) => setProveedor(e.target.value)} className={inputCls} />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm font-medium text-text">Método de pago</span>
            <select value={metodo} onChange={(e) => setMetodo(e.target.value as MetodoGasto)} className={inputCls}>
              {METODOS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-text">Estado</span>
            <select value={estado} onChange={(e) => setEstado(e.target.value as EstadoGasto)} className={inputCls}>
              <option value="pagado">Pagado</option>
              <option value="pendiente">Pendiente</option>
            </select>
          </label>
        </div>
      </div>

      <footer className="flex justify-end gap-2 border-t border-border p-4">
        <Button variant="secondary" onClick={onCerrar}>Cancelar</Button>
        <Button disabled={!valido} onClick={guardar}>
          <Check size={18} /> Guardar
        </Button>
      </footer>
    </Modal>
  );
}
