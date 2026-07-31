import { useState } from 'react';
import {
  Gift,
  Plus,
  Pencil,
  Trash2,
  Star,
  Users,
  Settings2,
  Package,
  BadgeDollarSign,
  Percent,
  X,
  Check,
  Save,
  type LucideIcon,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { PageHeader } from '@/components/layout/PageHeader';
import { useToast } from '@/lib/toast';
import { useOperacion } from '@/lib/operacion';
import { useClientes } from '@/lib/clientes';
import { useRecompensasAdmin, useRecompensaMutations, useConfigLealtad, useConfigLealtadMutation } from '@/lib/lealtad';
import { type RecompensaApi, type RecompensaInput } from '@/lib/api';
import { cn } from '@/lib/cn';
import { formatCurrency } from '@/lib/format';

type TipoRecompensa = RecompensaApi['tipo'];

const tipoConfig: Record<TipoRecompensa, { label: string; icon: LucideIcon; tone: 'brand' | 'action' | 'info' }> = {
  producto: { label: 'Producto gratis', icon: Package, tone: 'brand' },
  descuento_monto: { label: 'Descuento Q', icon: BadgeDollarSign, tone: 'action' },
  descuento_pct: { label: 'Descuento %', icon: Percent, tone: 'info' },
};

export function LealtadPage() {
  const { productos } = useOperacion();
  const { data: clientes = [] } = useClientes();
  const { data: recompensas = [] } = useRecompensasAdmin();
  const { data: config } = useConfigLealtad();
  const { crear, editar, eliminar: eliminarMut } = useRecompensaMutations();
  const guardarConfig = useConfigLealtadMutation();
  const toast = useToast();
  const confirm = useConfirm();

  const tasaActual = config?.quetzalesPorPunto ?? 10;
  const [tasa, setTasa] = useState('');
  const tasaInput = tasa || String(tasaActual);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<RecompensaApi | null>(null);

  const puntosEnCirculacion = clientes.reduce((s, c) => s + c.puntos, 0);
  const clientesConPuntos = clientes.filter((c) => c.puntos > 0).length;

  async function guardarTasa() {
    const n = parseFloat(tasaInput);
    if (!(n > 0)) {
      toast.error('La tasa debe ser mayor a 0.');
      return;
    }
    try {
      await guardarConfig.mutateAsync(n);
      toast.exito(`Tasa guardada: 1 punto por cada ${formatCurrency(n)}.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo guardar la tasa.');
    }
  }

  async function guardar(input: RecompensaInput) {
    try {
      if (editando) {
        await editar.mutateAsync({ id: editando.id, data: input });
        toast.exito(`Recompensa "${input.nombre}" actualizada.`);
      } else {
        await crear.mutateAsync(input);
        toast.exito(`Recompensa "${input.nombre}" creada.`);
      }
      setModalAbierto(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo guardar la recompensa.');
    }
  }

  async function toggle(r: RecompensaApi) {
    try {
      await editar.mutateAsync({ id: r.id, data: { activa: !r.activa } });
      toast.info(`"${r.nombre}" ${r.activa ? 'desactivada' : 'activada'}.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo actualizar.');
    }
  }

  async function eliminar(r: RecompensaApi) {
    const ok = await confirm({
      titulo: 'Eliminar recompensa',
      mensaje: `¿Eliminar "${r.nombre}"? Los clientes ya no podrán canjearla.`,
      confirmar: 'Eliminar',
      peligro: true,
    });
    if (!ok) return;
    try {
      await eliminarMut.mutateAsync(r.id);
      toast.info(`Recompensa "${r.nombre}" eliminada.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo eliminar.');
    }
  }

  return (
    <div className="space-y-5 p-4 sm:space-y-6 sm:p-6">
      <PageHeader
        title="Fidelización"
        subtitle="Puntos por compra y recompensas canjeables"
        actions={
          <Button onClick={() => { setEditando(null); setModalAbierto(true); }}>
            <Plus size={18} /> Nueva recompensa
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi icon={Star} label="Puntos en circulación" valor={String(puntosEnCirculacion)} tono="accent" />
        <Kpi icon={Users} label="Clientes con puntos" valor={String(clientesConPuntos)} tono="brand" />
        <Kpi icon={Gift} label="Recompensas activas" valor={String(recompensas.filter((r) => r.activa).length)} tono="action" />
        <Kpi icon={Settings2} label="Tasa actual" valor={`1 pt / ${formatCurrency(tasaActual)}`} tono="info" chico />
      </div>

      {/* Configuración de la tasa */}
      <Card className="p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-brand-100 text-brand-700">
            <Settings2 size={20} />
          </span>
          <div className="flex-1">
            <h2 className="font-display text-lg font-semibold text-text">Acumulación de puntos</h2>
            <p className="text-sm text-text-muted">Define cuánto debe gastar el cliente para ganar 1 punto.</p>
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <label className="block">
                <span className="text-sm font-medium text-text">Quetzales por punto</span>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-sm text-text-muted">1 punto por cada Q</span>
                  <input
                    type="number"
                    min={1}
                    step="1"
                    value={tasaInput}
                    onChange={(e) => setTasa(e.target.value)}
                    className="num h-10 w-24 rounded-md border border-border bg-surface-alt px-3 text-right text-sm text-text focus:border-action-500 focus:outline-none"
                  />
                </div>
              </label>
              <Button onClick={guardarTasa}>
                <Save size={18} /> Guardar tasa
              </Button>
            </div>
            <p className="mt-2 text-xs text-text-muted">
              Ejemplo: con la tasa actual, una compra de {formatCurrency(85)} otorga{' '}
              <span className="num font-semibold text-text">{Math.floor(85 / (parseFloat(tasaInput) || 1))} puntos</span>.
            </p>
          </div>
        </div>
      </Card>

      {/* Recompensas */}
      <div>
        <h2 className="mb-3 font-display text-lg font-semibold text-text">Recompensas</h2>
        {recompensas.length === 0 ? (
          <Card className="p-8 text-center">
            <Gift size={32} className="mx-auto text-text-muted" />
            <p className="mt-2 text-sm font-medium text-text">Sin recompensas</p>
            <p className="text-sm text-text-muted">Crea la primera con “Nueva recompensa”.</p>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {recompensas.map((r) => {
              const cfg = tipoConfig[r.tipo];
              const Icono = cfg.icon;
              const producto = r.productoId ? productos.find((p) => p.id === r.productoId) : undefined;
              return (
                <div
                  key={r.id}
                  className={cn(
                    'flex flex-col rounded-lg border bg-surface p-4 shadow-card transition-opacity',
                    r.activa ? 'border-border' : 'border-border opacity-60',
                  )}
                >
                  <div className="flex items-start justify-between">
                    <span className={cn('grid h-10 w-10 place-items-center rounded-md',
                      cfg.tone === 'brand' ? 'bg-brand-100 text-brand-700'
                        : cfg.tone === 'action' ? 'bg-action-50 text-action-700'
                        : 'bg-info/12 text-info',
                    )}>
                      <Icono size={20} />
                    </span>
                    <button
                      onClick={() => toggle(r)}
                      role="switch"
                      aria-checked={r.activa}
                      aria-label={r.activa ? 'Desactivar' : 'Activar'}
                      className={cn(
                        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-500',
                        r.activa ? 'bg-success' : 'bg-surface-sunk',
                      )}
                    >
                      <span className={cn('inline-block h-5 w-5 rounded-full bg-surface shadow transition-transform', r.activa ? 'translate-x-5' : 'translate-x-0.5')} />
                    </button>
                  </div>

                  <h3 className="mt-3 font-display text-lg font-semibold text-text">{r.nombre}</h3>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Badge tone={cfg.tone}>{cfg.label}</Badge>
                    <span className="num inline-flex items-center gap-1 text-sm font-semibold text-accent-600">
                      <Star size={13} /> {r.costoPuntos} pts
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-text-muted">
                    {r.tipo === 'producto' && `Canjea: ${producto?.nombre ?? 'producto'} sin costo`}
                    {r.tipo === 'descuento_monto' && `Descuento de ${formatCurrency(r.valor ?? 0)}`}
                    {r.tipo === 'descuento_pct' && `${r.valor ?? 0}% de descuento`}
                  </p>

                  <div className="mt-4 flex gap-1.5 border-t border-border pt-3">
                    <Button size="sm" variant="secondary" className="flex-1" onClick={() => { setEditando(r); setModalAbierto(true); }}>
                      <Pencil size={15} /> Editar
                    </Button>
                    <button
                      onClick={() => eliminar(r)}
                      aria-label={`Eliminar ${r.nombre}`}
                      className="grid h-8 w-8 place-items-center rounded-md border border-border text-danger hover:bg-danger/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modalAbierto && (
        <RecompensaModal recompensa={editando} onCerrar={() => setModalAbierto(false)} onGuardar={guardar} />
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
  tono: 'brand' | 'action' | 'info' | 'accent';
  chico?: boolean;
}) {
  const tonos: Record<string, string> = {
    brand: 'bg-brand-100 text-brand-700',
    action: 'bg-action-50 text-action-700',
    info: 'bg-info/12 text-info',
    accent: 'bg-accent-400/25 text-accent-600',
  };
  return (
    <Card className="p-4">
      <span className={cn('grid h-9 w-9 place-items-center rounded-md', tonos[tono])}>
        <Icon size={18} />
      </span>
      <p className="mt-3 text-sm text-text-muted">{label}</p>
      <p className={cn('mt-0.5 font-semibold text-text', chico ? 'text-base' : 'num text-2xl')}>{valor}</p>
    </Card>
  );
}

function RecompensaModal({
  recompensa,
  onCerrar,
  onGuardar,
}: {
  recompensa: RecompensaApi | null;
  onCerrar: () => void;
  onGuardar: (input: RecompensaInput) => void;
}) {
  const { productos } = useOperacion();
  const [nombre, setNombre] = useState(recompensa?.nombre ?? '');
  const [tipo, setTipo] = useState<TipoRecompensa>(recompensa?.tipo ?? 'producto');
  const [costoPuntos, setCostoPuntos] = useState(recompensa ? String(recompensa.costoPuntos) : '');
  const [productoId, setProductoId] = useState(recompensa?.productoId ?? productos[0]?.id ?? '');
  const [valor, setValor] = useState(recompensa?.valor != null ? String(recompensa.valor) : '');

  const costoNum = parseInt(costoPuntos, 10);
  const valorNum = parseFloat(valor) || 0;
  const requiereValor = tipo === 'descuento_monto' || tipo === 'descuento_pct';
  const requiereProducto = tipo === 'producto';
  const valido =
    nombre.trim() !== '' &&
    costoNum > 0 &&
    (!requiereValor || valorNum > 0) &&
    (!requiereProducto || productoId !== '');

  const inputCls =
    'mt-1 h-10 w-full rounded-md border border-border bg-surface-alt px-3 text-sm text-text focus:border-action-500 focus:outline-none';

  const labelValor = tipo === 'descuento_pct' ? 'Porcentaje (%)' : 'Monto (Q)';

  function guardar() {
    onGuardar({
      nombre: nombre.trim(),
      tipo,
      costoPuntos: costoNum,
      productoId: requiereProducto ? productoId : undefined,
      valor: requiereValor ? valorNum : undefined,
    });
  }

  return (
    <Modal onClose={onCerrar} ariaLabel={recompensa ? 'Editar recompensa' : 'Nueva recompensa'} className="w-full max-w-md">
      <header className="flex items-center justify-between border-b border-border p-4">
        <h3 className="font-display text-lg font-semibold text-text">{recompensa ? 'Editar recompensa' : 'Nueva recompensa'}</h3>
        <button onClick={onCerrar} aria-label="Cerrar" className="grid h-9 w-9 place-items-center rounded-md border border-border hover:bg-surface-sunk">
          <X size={18} />
        </button>
      </header>

      <div className="space-y-4 p-4">
        <label className="block">
          <span className="text-sm font-medium text-text">Nombre</span>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Papas gratis…" autoFocus className={inputCls} />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm font-medium text-text">Tipo</span>
            <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoRecompensa)} className={inputCls}>
              <option value="producto">Producto gratis</option>
              <option value="descuento_monto">Descuento Q</option>
              <option value="descuento_pct">Descuento %</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-text">Costo en puntos</span>
            <input type="number" min={1} value={costoPuntos} onChange={(e) => setCostoPuntos(e.target.value)} className={cn(inputCls, 'num')} />
          </label>
        </div>

        {requiereProducto ? (
          <label className="block">
            <span className="text-sm font-medium text-text">Producto a regalar</span>
            <select value={productoId} onChange={(e) => setProductoId(e.target.value)} className={inputCls}>
              {productos.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre} · {formatCurrency(p.precio)}</option>
              ))}
            </select>
            <span className="mt-1 block text-xs text-text-muted">Al canjearla se rebaja del inventario con su movimiento justificado.</span>
          </label>
        ) : (
          <label className="block">
            <span className="text-sm font-medium text-text">{labelValor}</span>
            <input type="number" min={0} value={valor} onChange={(e) => setValor(e.target.value)} className={cn(inputCls, 'num')} />
          </label>
        )}
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
