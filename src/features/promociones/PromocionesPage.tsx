import { useMemo, useState } from 'react';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Tag,
  Percent,
  BadgeDollarSign,
  Gift,
  Layers,
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
import { usePromociones, usePromocionMutations } from '@/lib/promociones';
import { type PromocionApi, type PromocionInput } from '@/lib/api';

type TipoPromo = PromocionApi['tipo'];
type Promocion = PromocionApi;

const tipoConfig: Record<TipoPromo, { label: string; icon: LucideIcon; tone: 'brand' | 'action' | 'accent' | 'info' }> = {
  porcentaje: { label: 'Descuento %', icon: Percent, tone: 'action' },
  monto: { label: 'Monto fijo', icon: BadgeDollarSign, tone: 'brand' },
  '2x1': { label: '2x1', icon: Gift, tone: 'accent' },
  combo: { label: 'Combo', icon: Layers, tone: 'info' },
};

/** Describe el "beneficio" de una promo en texto legible. */
function beneficio(p: Promocion): string {
  switch (p.tipo) {
    case 'porcentaje': return `${p.valor}% de descuento`;
    case 'monto': return `${formatCurrency(p.valor)} de descuento`;
    case '2x1': return 'Lleva 2, paga 1';
    case 'combo': return `Precio combo ${formatCurrency(p.valor)}`;
  }
}

export function PromocionesPage() {
  const { data: promos = [] } = usePromociones();
  const { crear, editar, eliminar: eliminarMut } = usePromocionMutations();
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<Promocion | null>(null);
  const toast = useToast();
  const confirm = useConfirm();

  const q = busqueda.trim().toLowerCase();
  const visibles = useMemo(
    () => promos.filter((p) => !q || p.nombre.toLowerCase().includes(q) || p.aplicaEn.toLowerCase().includes(q)),
    [promos, q],
  );

  const activas = promos.filter((p) => p.activa).length;

  async function toggle(p: Promocion) {
    try {
      await editar.mutateAsync({ id: p.id, data: { activa: !p.activa } });
      toast.info(`"${p.nombre}" ${p.activa ? 'desactivada' : 'activada'}.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo actualizar.');
    }
  }

  async function guardar(input: PromocionInput) {
    try {
      if (editando) {
        await editar.mutateAsync({ id: editando.id, data: input });
        toast.exito(`Promoción "${input.nombre}" actualizada.`);
      } else {
        await crear.mutateAsync(input);
        toast.exito(`Promoción "${input.nombre}" creada.`);
      }
      setModalAbierto(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo guardar la promoción.');
    }
  }

  async function eliminar(p: Promocion) {
    const ok = await confirm({
      titulo: 'Eliminar promoción',
      mensaje: `¿Eliminar "${p.nombre}"? Esta acción no se puede deshacer.`,
      confirmar: 'Eliminar',
      peligro: true,
    });
    if (!ok) return;
    try {
      await eliminarMut.mutateAsync(p.id);
      toast.info(`Promoción "${p.nombre}" eliminada.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo eliminar.');
    }
  }

  return (
    <div className="space-y-5 p-4 sm:space-y-6 sm:p-6">
      <PageHeader
        title="Promociones"
        subtitle={`${activas} de ${promos.length} promociones activas`}
        actions={
          <Button onClick={() => { setEditando(null); setModalAbierto(true); }}>
            <Plus size={18} /> Nueva promoción
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <div className="border-b border-border p-4">
          <div className="relative max-w-sm">
            <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar promoción…"
              className="h-10 w-full rounded-md border border-border bg-surface-alt pl-10 pr-4 text-sm text-text placeholder:text-text-muted focus:border-action-500 focus:outline-none"
            />
          </div>
        </div>

        {visibles.length === 0 ? (
          <div className="p-8 text-center">
            <Tag size={32} className="mx-auto text-text-muted" />
            <p className="mt-2 text-sm font-medium text-text">Sin promociones</p>
            <p className="text-sm text-text-muted">Crea la primera con “Nueva promoción”.</p>
          </div>
        ) : (
          <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibles.map((p) => {
              const cfg = tipoConfig[p.tipo];
              const Icono = cfg.icon;
              return (
                <div
                  key={p.id}
                  className={cn(
                    'flex flex-col rounded-lg border bg-surface p-4 shadow-card transition-opacity',
                    p.activa ? 'border-border' : 'border-border opacity-60',
                  )}
                >
                  <div className="flex items-start justify-between">
                    <span className={cn('grid h-10 w-10 place-items-center rounded-md',
                      cfg.tone === 'brand' ? 'bg-brand-100 text-brand-700'
                        : cfg.tone === 'action' ? 'bg-action-50 text-action-700'
                        : cfg.tone === 'accent' ? 'bg-accent-400/25 text-accent-600'
                        : 'bg-info/12 text-info',
                    )}>
                      <Icono size={20} />
                    </span>
                    <button
                      onClick={() => toggle(p)}
                      role="switch"
                      aria-checked={p.activa}
                      aria-label={p.activa ? 'Desactivar' : 'Activar'}
                      className={cn(
                        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-500',
                        p.activa ? 'bg-success' : 'bg-surface-sunk',
                      )}
                    >
                      <span className={cn('inline-block h-5 w-5 rounded-full bg-surface shadow transition-transform', p.activa ? 'translate-x-5' : 'translate-x-0.5')} />
                    </button>
                  </div>

                  <h3 className="mt-3 font-display text-lg font-semibold text-text">{p.nombre}</h3>
                  <div className="mt-1 flex items-center gap-2">
                    <Badge tone={cfg.tone}>{cfg.label}</Badge>
                    <span className="text-sm font-medium text-text">{beneficio(p)}</span>
                  </div>

                  <dl className="mt-3 space-y-1 text-xs text-text-muted">
                    <div className="flex justify-between">
                      <dt>Aplica en</dt>
                      <dd className="font-medium text-text">{p.aplicaEn}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Vigencia</dt>
                      <dd className="font-medium text-text">{p.vigencia}</dd>
                    </div>
                  </dl>

                  <div className="mt-4 flex gap-1.5 border-t border-border pt-3">
                    <Button size="sm" variant="secondary" className="flex-1" onClick={() => { setEditando(p); setModalAbierto(true); }}>
                      <Pencil size={15} /> Editar
                    </Button>
                    <button
                      onClick={() => eliminar(p)}
                      aria-label={`Eliminar ${p.nombre}`}
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
      </Card>

      {modalAbierto && (
        <PromoModal promo={editando} onCerrar={() => setModalAbierto(false)} onGuardar={guardar} />
      )}
    </div>
  );
}

function PromoModal({
  promo,
  onCerrar,
  onGuardar,
}: {
  promo: Promocion | null;
  onCerrar: () => void;
  onGuardar: (input: PromocionInput) => void;
}) {
  const [nombre, setNombre] = useState(promo?.nombre ?? '');
  const [tipo, setTipo] = useState<TipoPromo>(promo?.tipo ?? 'porcentaje');
  const [valor, setValor] = useState(promo ? String(promo.valor) : '');
  const [aplicaEn, setAplicaEn] = useState(promo?.aplicaEn ?? '');
  const [vigencia, setVigencia] = useState(promo?.vigencia ?? '');

  const requiereValor = tipo === 'porcentaje' || tipo === 'monto' || tipo === 'combo';
  const valorNum = parseFloat(valor) || 0;
  const valido = nombre.trim() !== '' && aplicaEn.trim() !== '' && (!requiereValor || valorNum > 0);

  const inputCls =
    'mt-1 h-10 w-full rounded-md border border-border bg-surface-alt px-3 text-sm text-text focus:border-action-500 focus:outline-none';

  const labelValor: Record<TipoPromo, string> = {
    porcentaje: 'Porcentaje (%)',
    monto: 'Monto de descuento (Q)',
    combo: 'Precio del combo (Q)',
    '2x1': 'No requiere valor',
  };

  function guardar() {
    onGuardar({
      nombre: nombre.trim(),
      tipo,
      valor: requiereValor ? valorNum : 0,
      aplicaEn: aplicaEn.trim() || undefined,
      vigencia: vigencia.trim() || 'Todos los días',
    });
  }

  return (
    <Modal onClose={onCerrar} ariaLabel={promo ? 'Editar promoción' : 'Nueva promoción'} className="w-full max-w-md">
      <header className="flex items-center justify-between border-b border-border p-4">
        <h3 className="font-display text-lg font-semibold text-text">{promo ? 'Editar promoción' : 'Nueva promoción'}</h3>
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
          <span className="text-sm font-medium text-text">Nombre</span>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Happy Hour papas…" autoFocus className={inputCls} />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm font-medium text-text">Tipo</span>
            <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoPromo)} className={inputCls}>
              <option value="porcentaje">Descuento %</option>
              <option value="monto">Monto fijo</option>
              <option value="2x1">2x1</option>
              <option value="combo">Combo</option>
            </select>
          </label>
          <label className={cn('block', !requiereValor && 'opacity-50')}>
            <span className="text-sm font-medium text-text">{labelValor[tipo]}</span>
            <input
              type="number"
              min={0}
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              disabled={!requiereValor}
              className={cn(inputCls, 'num')}
            />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-text">Aplica en</span>
          <input value={aplicaEn} onChange={(e) => setAplicaEn(e.target.value)} placeholder="Categoría o producto específico" className={inputCls} />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-text">Vigencia</span>
          <input value={vigencia} onChange={(e) => setVigencia(e.target.value)} placeholder="L–V · 15:00–17:00" className={inputCls} />
        </label>
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
