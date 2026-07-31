import { useEffect, useState } from 'react';
import { Plus, BookOpen, TrendingUp, Pencil, Trash2, X, Check } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { PageHeader } from '@/components/layout/PageHeader';
import { cn } from '@/lib/cn';
import { formatCurrency } from '@/lib/format';
import { useEsAdmin } from '@/lib/auth';
import { useToast } from '@/lib/toast';
import { useOperacion } from '@/lib/operacion';
import { useInsumos } from '@/lib/inventario';
import { useRecetas, useRecetaMutations } from '@/lib/recetas';
import { type RecetaApi, type RecetaInput } from '@/lib/api';

export function RecetarioPage() {
  const { data: recetas = [] } = useRecetas();
  const { eliminar } = useRecetaMutations();
  const [seleccionadaId, setSeleccionadaId] = useState<string | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editando, setEditando] = useState<RecetaApi | null>(null);
  const esAdmin = useEsAdmin();
  const toast = useToast();
  const confirm = useConfirm();

  // Selecciona la primera receta cuando llegan los datos (o si se borró la activa).
  useEffect(() => {
    if (recetas.length && !recetas.some((r) => r.id === seleccionadaId)) {
      setSeleccionadaId(recetas[0].id);
    }
  }, [recetas, seleccionadaId]);

  const receta = recetas.find((r) => r.id === seleccionadaId) ?? null;
  const margen = receta && receta.precioVenta > 0
    ? Math.round(((receta.precioVenta - receta.costo) / receta.precioVenta) * 100)
    : 0;

  async function borrar(r: RecetaApi) {
    const ok = await confirm({
      titulo: 'Eliminar receta',
      mensaje: `¿Eliminar la receta de "${r.producto}"? El producto seguirá existiendo, pero dejará de descontar inventario al venderse.`,
      confirmar: 'Eliminar',
      peligro: true,
    });
    if (!ok) return;
    try {
      await eliminar.mutateAsync(r.id);
      toast.info(`Receta de "${r.producto}" eliminada.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo eliminar la receta.');
    }
  }

  return (
    <div className="space-y-5 p-4 sm:space-y-6 sm:p-6">
      <PageHeader
        title={esAdmin ? 'Recetario y costeo' : 'Recetario'}
        subtitle={esAdmin ? `${recetas.length} recetas · costo calculado desde inventario` : `${recetas.length} recetas`}
        actions={
          esAdmin ? (
            <Button onClick={() => { setEditando(null); setModalAbierto(true); }}>
              <Plus size={18} /> Nueva receta
            </Button>
          ) : undefined
        }
      />

      {recetas.length === 0 ? (
        <Card className="p-8 text-center text-sm text-text-muted">
          Aún no hay recetas. {esAdmin ? 'Crea la primera con “Nueva receta”.' : ''}
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Lista de recetas */}
          <div className="space-y-2 lg:col-span-1">
            {recetas.map((r) => {
              const m = r.precioVenta > 0 ? Math.round(((r.precioVenta - r.costo) / r.precioVenta) * 100) : 0;
              return (
                <button
                  key={r.id}
                  onClick={() => setSeleccionadaId(r.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg border bg-surface p-3 text-left shadow-card transition-colors',
                    seleccionadaId === r.id ? 'border-action-500 bg-action-50' : 'border-border hover:bg-surface-alt',
                  )}
                >
                  <span className="text-2xl" aria-hidden>{r.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-text">{r.producto}</div>
                    <div className="num text-xs text-text-muted">
                      {esAdmin && <>Costo {formatCurrency(r.costo)} · </>}
                      {r.detalle.length} insumos
                    </div>
                  </div>
                  {esAdmin && <Badge tone={m >= 70 ? 'success' : 'warning'}>{m}%</Badge>}
                </button>
              );
            })}
          </div>

          {/* Detalle de la receta */}
          <div className="space-y-4 lg:col-span-2">
            {receta && esAdmin && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Card className="p-4">
                  <div className="text-sm text-text-muted">Precio de venta</div>
                  <div className="num mt-1 text-xl font-semibold text-text">{formatCurrency(receta.precioVenta)}</div>
                </Card>
                <Card className="p-4">
                  <div className="text-sm text-text-muted">Costo</div>
                  <div className="num mt-1 text-xl font-semibold text-brand-700">{formatCurrency(receta.costo)}</div>
                </Card>
                <Card className="p-4">
                  <div className="text-sm text-text-muted">Utilidad</div>
                  <div className="num mt-1 text-xl font-semibold text-success">
                    {formatCurrency(receta.precioVenta - receta.costo)}
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="text-sm text-text-muted">Margen</div>
                  <div className="num mt-1 inline-flex items-center gap-1 text-xl font-semibold text-action-700">
                    <TrendingUp size={16} /> {margen}%
                  </div>
                </Card>
              </div>
            )}

            {receta && (
              <Card className="p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <BookOpen size={18} className="text-brand-500" />
                    <h2 className="font-display text-lg font-semibold text-text">
                      Ingredientes de “{receta.producto}”
                    </h2>
                  </div>
                  {esAdmin && (
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => { setEditando(receta); setModalAbierto(true); }}
                        aria-label="Editar receta"
                        className="grid h-8 w-8 place-items-center rounded-md border border-border text-text-muted hover:bg-surface-sunk hover:text-text"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => borrar(receta)}
                        aria-label="Eliminar receta"
                        className="grid h-8 w-8 place-items-center rounded-md border border-border text-danger hover:bg-danger/10"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="mt-3 overflow-x-auto scroll-thin">
                  <table className="w-full min-w-[26rem] text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-text-muted">
                        <th className="pb-2 font-medium">Insumo</th>
                        <th className="pb-2 text-right font-medium">Cantidad</th>
                        <th className="pb-2 text-right font-medium">Merma</th>
                        {esAdmin && <th className="pb-2 text-right font-medium">Costo</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {receta.detalle.map((it, i) => (
                        <tr key={i} className="border-b border-border/60 last:border-0">
                          <td className="py-2 font-medium text-text">{it.insumo}</td>
                          <td className="num py-2 text-right text-text-muted">{it.cantidad}</td>
                          <td className="num py-2 text-right text-text-muted">{it.merma}</td>
                          {esAdmin && <td className="num py-2 text-right font-semibold text-text">{formatCurrency(it.costo)}</td>}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-3 text-xs text-text-muted">
                  {esAdmin
                    ? 'El costo se recalcula automáticamente cuando cambia el precio de un insumo en inventario. Al facturar, estos insumos se descuentan por explosión de receta.'
                    : 'Al facturar, estos insumos se descuentan del inventario por explosión de receta.'}
                </p>
              </Card>
            )}
          </div>
        </div>
      )}

      {modalAbierto && (
        <RecetaModal
          receta={editando}
          recetasExistentes={recetas}
          onCerrar={() => setModalAbierto(false)}
          onGuardado={() => { setModalAbierto(false); setSeleccionadaId(null); }}
        />
      )}
    </div>
  );
}

type FilaInsumo = { insumoId: string; cantidad: string; mermaPct: string };

function RecetaModal({
  receta,
  recetasExistentes,
  onCerrar,
  onGuardado,
}: {
  receta: RecetaApi | null;
  recetasExistentes: RecetaApi[];
  onCerrar: () => void;
  onGuardado: () => void;
}) {
  const { productos } = useOperacion();
  const { data: insumos = [] } = useInsumos();
  const { guardar } = useRecetaMutations();
  const toast = useToast();

  // Al crear, solo productos sin receta; al editar, el producto queda fijo.
  const productosSinReceta = productos.filter(
    (p) => !recetasExistentes.some((r) => r.productoId === p.id) || p.id === receta?.productoId,
  );
  const [productoId, setProductoId] = useState(receta?.productoId ?? productosSinReceta[0]?.id ?? '');
  const [filas, setFilas] = useState<FilaInsumo[]>(
    receta
      ? receta.items.map((i) => ({ insumoId: i.insumoId, cantidad: String(i.cantidad), mermaPct: String(i.mermaPct) }))
      : [{ insumoId: insumos[0]?.id ?? '', cantidad: '', mermaPct: '0' }],
  );

  const inputCls =
    'h-9 w-full rounded-md border border-border bg-surface-alt px-2 text-sm text-text focus:border-action-500 focus:outline-none';

  const filasValidas = filas.filter((f) => f.insumoId && parseFloat(f.cantidad) > 0);
  const valido = productoId !== '' && filasValidas.length > 0;

  function setFila(idx: number, patch: Partial<FilaInsumo>) {
    setFilas((prev) => prev.map((f, i) => (i === idx ? { ...f, ...patch } : f)));
  }
  function agregarFila() {
    setFilas((prev) => [...prev, { insumoId: insumos[0]?.id ?? '', cantidad: '', mermaPct: '0' }]);
  }
  function quitarFila(idx: number) {
    setFilas((prev) => prev.filter((_, i) => i !== idx));
  }

  async function submit() {
    const input: RecetaInput = {
      productoId,
      items: filasValidas.map((f) => ({
        insumoId: f.insumoId,
        cantidad: parseFloat(f.cantidad),
        mermaPct: parseFloat(f.mermaPct) || 0,
      })),
    };
    try {
      await guardar.mutateAsync(input);
      toast.exito(receta ? 'Receta actualizada.' : 'Receta creada.');
      onGuardado();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'No se pudo guardar la receta.');
    }
  }

  return (
    <Modal onClose={onCerrar} ariaLabel={receta ? 'Editar receta' : 'Nueva receta'} className="w-full max-w-lg">
      <header className="flex items-center justify-between border-b border-border p-4">
        <h3 className="font-display text-lg font-semibold text-text">{receta ? 'Editar receta' : 'Nueva receta'}</h3>
        <button onClick={onCerrar} aria-label="Cerrar" className="grid h-9 w-9 place-items-center rounded-md border border-border hover:bg-surface-sunk">
          <X size={18} />
        </button>
      </header>

      <div className="space-y-4 p-4">
        <label className="block">
          <span className="text-sm font-medium text-text">Producto</span>
          <select
            value={productoId}
            onChange={(e) => setProductoId(e.target.value)}
            disabled={!!receta}
            className={cn('mt-1', inputCls, 'h-10', receta && 'opacity-60')}
          >
            {productosSinReceta.length === 0 && <option value="">Sin productos disponibles</option>}
            {productosSinReceta.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </label>

        <div>
          <div className="mb-1 grid grid-cols-[1fr_5rem_4.5rem_2rem] gap-2 text-xs font-medium text-text-muted">
            <span>Insumo</span>
            <span className="text-right">Cantidad</span>
            <span className="text-right">Merma %</span>
            <span />
          </div>
          <div className="space-y-2">
            {filas.map((f, i) => (
              <div key={i} className="grid grid-cols-[1fr_5rem_4.5rem_2rem] items-center gap-2">
                <select value={f.insumoId} onChange={(e) => setFila(i, { insumoId: e.target.value })} className={inputCls}>
                  {insumos.length === 0 && <option value="">Sin insumos</option>}
                  {insumos.map((ins) => (
                    <option key={ins.id} value={ins.id}>{ins.nombre} ({ins.unidad})</option>
                  ))}
                </select>
                <input type="number" min={0} step="0.001" value={f.cantidad} onChange={(e) => setFila(i, { cantidad: e.target.value })} className={cn(inputCls, 'num text-right')} />
                <input type="number" min={0} max={100} step="0.5" value={f.mermaPct} onChange={(e) => setFila(i, { mermaPct: e.target.value })} className={cn(inputCls, 'num text-right')} />
                <button
                  onClick={() => quitarFila(i)}
                  disabled={filas.length === 1}
                  aria-label="Quitar insumo"
                  className="grid h-9 w-8 place-items-center rounded-md border border-border text-danger hover:bg-danger/10 disabled:opacity-40"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
          <button onClick={agregarFila} className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-action-700 hover:underline">
            <Plus size={15} /> Agregar insumo
          </button>
        </div>
      </div>

      <footer className="flex justify-end gap-2 border-t border-border p-4">
        <Button variant="secondary" onClick={onCerrar}>Cancelar</Button>
        <Button disabled={!valido} onClick={submit}>
          <Check size={18} /> Guardar
        </Button>
      </footer>
    </Modal>
  );
}
