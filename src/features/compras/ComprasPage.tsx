import { useMemo, useState } from 'react';
import {
  Plus,
  Search,
  Eye,
  PackageCheck,
  Truck,
  FileText,
  X,
  Check,
  Trash2,
  ShoppingCart,
  CircleDollarSign,
  type LucideIcon,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Drawer } from '@/components/ui/Drawer';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { PageHeader } from '@/components/layout/PageHeader';
import { useToast } from '@/lib/toast';
import { cn } from '@/lib/cn';
import { formatCurrency } from '@/lib/format';
import { ordenesSeed, proveedoresSeed, type OrdenCompra, type EstadoOrden } from '@/mock/data';

const estadoConfig: Record<EstadoOrden, { label: string; tone: 'neutral' | 'info' | 'success' | 'danger' }> = {
  borrador: { label: 'Borrador', tone: 'neutral' },
  enviada: { label: 'Enviada', tone: 'info' },
  recibida: { label: 'Recibida', tone: 'success' },
  cancelada: { label: 'Cancelada', tone: 'danger' },
};

const totalOrden = (o: OrdenCompra) => o.items.reduce((s, i) => s + i.cantidad * i.costoUnitario, 0);

export function ComprasPage() {
  const [ordenes, setOrdenes] = useState<OrdenCompra[]>(ordenesSeed);
  const [busqueda, setBusqueda] = useState('');
  const [detalle, setDetalle] = useState<OrdenCompra | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const toast = useToast();
  const confirm = useConfirm();

  const q = busqueda.trim().toLowerCase();
  const visibles = useMemo(
    () => ordenes.filter((o) => !q || o.folio.toLowerCase().includes(q) || o.proveedor.toLowerCase().includes(q)),
    [ordenes, q],
  );

  const pendientes = ordenes.filter((o) => o.estado === 'enviada').length;
  const porRecibir = ordenes
    .filter((o) => o.estado === 'enviada' || o.estado === 'borrador')
    .reduce((s, o) => s + totalOrden(o), 0);
  const recibidasMes = ordenes.filter((o) => o.estado === 'recibida').length;

  function recibir(o: OrdenCompra) {
    setOrdenes((prev) => prev.map((x) => (x.id === o.id ? { ...x, estado: 'recibida' } : x)));
    setDetalle((d) => (d?.id === o.id ? { ...d, estado: 'recibida' } : d));
    toast.exito(`Orden ${o.folio} recibida. Inventario actualizado.`);
  }

  function crear(nueva: OrdenCompra) {
    setOrdenes((prev) => [nueva, ...prev]);
    setModalAbierto(false);
    toast.exito(`Orden ${nueva.folio} creada.`);
  }

  async function eliminar(o: OrdenCompra) {
    const ok = await confirm({
      titulo: 'Eliminar orden',
      mensaje: `¿Eliminar la orden ${o.folio}? Esta acción no se puede deshacer.`,
      confirmar: 'Eliminar',
      peligro: true,
    });
    if (!ok) return;
    setOrdenes((prev) => prev.filter((x) => x.id !== o.id));
    setDetalle((d) => (d?.id === o.id ? null : d));
    toast.info(`Orden ${o.folio} eliminada.`);
  }

  return (
    <div className="space-y-5 p-4 sm:space-y-6 sm:p-6">
      <PageHeader
        title="Compras"
        subtitle="Órdenes de compra y recepción de mercadería"
        actions={
          <Button onClick={() => setModalAbierto(true)}>
            <Plus size={18} /> Nueva orden
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi icon={ShoppingCart} label="Órdenes totales" valor={String(ordenes.length)} tono="brand" />
        <Kpi icon={Truck} label="En tránsito" valor={String(pendientes)} tono="info" hint="enviadas" />
        <Kpi icon={CircleDollarSign} label="Por recibir" valor={formatCurrency(porRecibir)} tono="accent" />
        <Kpi icon={PackageCheck} label="Recibidas" valor={String(recibidasMes)} tono="success" />
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-border p-4">
          <div className="relative max-w-sm">
            <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por folio o proveedor…"
              className="h-10 w-full rounded-md border border-border bg-surface-alt pl-10 pr-4 text-sm text-text placeholder:text-text-muted focus:border-action-500 focus:outline-none"
            />
          </div>
        </div>

        {visibles.length === 0 ? (
          <p className="p-8 text-center text-sm text-text-muted">Sin órdenes que coincidan.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-text-muted">
                  <th className="px-4 py-2.5 font-semibold">Folio</th>
                  <th className="px-4 py-2.5 font-semibold">Proveedor</th>
                  <th className="px-4 py-2.5 font-semibold">Fecha</th>
                  <th className="px-4 py-2.5 font-semibold">Insumos</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Total</th>
                  <th className="px-4 py-2.5 font-semibold">Estado</th>
                  <th className="px-4 py-2.5 text-right font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((o) => (
                  <tr key={o.id} className="border-b border-border last:border-0 hover:bg-surface-alt">
                    <td className="num px-4 py-3 font-semibold text-text">{o.folio}</td>
                    <td className="px-4 py-3 text-text">{o.proveedor}</td>
                    <td className="num px-4 py-3 text-text-muted">{o.fecha}</td>
                    <td className="num px-4 py-3 text-text-muted">{o.items.length}</td>
                    <td className="num px-4 py-3 text-right font-semibold text-text">{formatCurrency(totalOrden(o))}</td>
                    <td className="px-4 py-3">
                      <Badge tone={estadoConfig[o.estado].tone}>{estadoConfig[o.estado].label}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        {(o.estado === 'enviada' || o.estado === 'borrador') && (
                          <Button size="sm" onClick={() => recibir(o)}>
                            <PackageCheck size={15} /> Recibir
                          </Button>
                        )}
                        <button
                          onClick={() => setDetalle(o)}
                          aria-label={`Ver ${o.folio}`}
                          className="grid h-8 w-8 place-items-center rounded-md border border-border text-text-muted hover:bg-surface-sunk hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-500"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => eliminar(o)}
                          aria-label={`Eliminar ${o.folio}`}
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

      <DetalleDrawer orden={detalle} onClose={() => setDetalle(null)} onRecibir={recibir} />
      {modalAbierto && <OrdenModal onCerrar={() => setModalAbierto(false)} onCrear={crear} totalOrdenes={ordenes.length} />}
    </div>
  );
}

function Kpi({
  icon: Icon,
  label,
  valor,
  tono,
  hint,
}: {
  icon: LucideIcon;
  label: string;
  valor: string;
  tono: 'brand' | 'success' | 'info' | 'accent';
  hint?: string;
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
      <p className="num mt-0.5 text-2xl font-semibold text-text">{valor}</p>
      {hint && <p className="text-xs text-text-muted">{hint}</p>}
    </Card>
  );
}

function DetalleDrawer({
  orden,
  onClose,
  onRecibir,
}: {
  orden: OrdenCompra | null;
  onClose: () => void;
  onRecibir: (o: OrdenCompra) => void;
}) {
  return (
    <Drawer open={orden !== null} onClose={onClose} ariaLabel="Detalle de la orden">
      {orden && (
        <>
          <header className="flex items-start justify-between border-b border-border p-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="num font-semibold text-text">{orden.folio}</span>
                <Badge tone={estadoConfig[orden.estado].tone}>{estadoConfig[orden.estado].label}</Badge>
              </div>
              <p className="mt-0.5 text-sm text-text-muted">{orden.proveedor} · {orden.fecha}</p>
            </div>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="grid h-9 w-9 place-items-center rounded-md border border-border hover:bg-surface-sunk"
            >
              <X size={18} />
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-auto scroll-thin p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-text-muted">
              <FileText size={14} /> Insumos de la orden
            </div>
            <ul className="mt-2 space-y-2">
              {orden.items.map((it, i) => (
                <li key={i} className="flex items-center justify-between rounded-md bg-surface-alt px-3 py-2">
                  <div>
                    <div className="text-sm font-medium text-text">{it.insumo}</div>
                    <div className="num text-xs text-text-muted">
                      {it.cantidad} {it.unidad} × {formatCurrency(it.costoUnitario)}
                    </div>
                  </div>
                  <span className="num text-sm font-semibold text-text">
                    {formatCurrency(it.cantidad * it.costoUnitario)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex justify-between border-t border-border pt-3 text-base font-semibold text-text">
              <span>Total de la orden</span>
              <span className="num">{formatCurrency(totalOrden(orden))}</span>
            </div>
          </div>

          {(orden.estado === 'enviada' || orden.estado === 'borrador') && (
            <footer className="border-t border-border p-4">
              <Button size="lg" className="w-full" onClick={() => onRecibir(orden)}>
                <PackageCheck size={18} /> Marcar como recibida
              </Button>
            </footer>
          )}
        </>
      )}
    </Drawer>
  );
}

function OrdenModal({
  onCerrar,
  onCrear,
  totalOrdenes,
}: {
  onCerrar: () => void;
  onCrear: (o: OrdenCompra) => void;
  totalOrdenes: number;
}) {
  const [proveedor, setProveedor] = useState(proveedoresSeed[0]);
  const [insumo, setInsumo] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [costo, setCosto] = useState('');

  const cantidadNum = parseFloat(cantidad) || 0;
  const costoNum = parseFloat(costo) || 0;
  const valido = insumo.trim() !== '' && cantidadNum > 0 && costoNum > 0;

  const inputCls =
    'mt-1 h-10 w-full rounded-md border border-border bg-surface-alt px-3 text-sm text-text focus:border-action-500 focus:outline-none';

  function guardar() {
    const folio = `OC-${String(90 + totalOrdenes).padStart(4, '0')}`;
    onCrear({
      id: `oc-${Date.now()}`,
      folio,
      proveedor,
      fecha: new Date().toLocaleDateString('es-GT'),
      estado: 'borrador',
      items: [{ insumo: insumo.trim(), cantidad: cantidadNum, unidad: 'u', costoUnitario: costoNum }],
    });
  }

  return (
    <Modal onClose={onCerrar} ariaLabel="Nueva orden de compra" className="w-full max-w-md">
      <header className="flex items-center justify-between border-b border-border p-4">
        <h3 className="font-display text-lg font-semibold text-text">Nueva orden de compra</h3>
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
          <span className="text-sm font-medium text-text">Proveedor</span>
          <select value={proveedor} onChange={(e) => setProveedor(e.target.value)} className={inputCls}>
            {proveedoresSeed.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium text-text">Insumo</span>
          <input value={insumo} onChange={(e) => setInsumo(e.target.value)} placeholder="Carne, papa, pan…" autoFocus className={inputCls} />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm font-medium text-text">Cantidad</span>
            <input type="number" min={0} value={cantidad} onChange={(e) => setCantidad(e.target.value)} className={cn(inputCls, 'num')} />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-text">Costo unitario (Q)</span>
            <input type="number" min={0} step="0.01" value={costo} onChange={(e) => setCosto(e.target.value)} className={cn(inputCls, 'num')} />
          </label>
        </div>

        <p className="text-xs text-text-muted">
          La orden se crea como borrador. Podrás agregar más insumos y marcarla como recibida cuando llegue.
        </p>
      </div>

      <footer className="flex justify-end gap-2 border-t border-border p-4">
        <Button variant="secondary" onClick={onCerrar}>Cancelar</Button>
        <Button disabled={!valido} onClick={guardar}>
          <Check size={18} /> Crear orden
        </Button>
      </footer>
    </Modal>
  );
}
