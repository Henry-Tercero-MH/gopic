import { useState } from 'react';
import { Plus, BookOpen, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/layout/PageHeader';
import { cn } from '@/lib/cn';
import { formatCurrency } from '@/lib/format';
import { recetas, recetaLatte } from '@/mock/data';

export function RecetarioPage() {
  const [seleccionada, setSeleccionada] = useState(recetas[0].id);
  const receta = recetas.find((r) => r.id === seleccionada)!;
  const margen = Math.round(((receta.precioVenta - receta.costo) / receta.precioVenta) * 100);

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Recetario y costeo"
        subtitle={`${recetas.length} recetas · costo calculado desde inventario`}
        actions={
          <Button>
            <Plus size={18} /> Nueva receta
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Lista de recetas */}
        <div className="space-y-2 lg:col-span-1">
          {recetas.map((r) => {
            const m = Math.round(((r.precioVenta - r.costo) / r.precioVenta) * 100);
            return (
              <button
                key={r.id}
                onClick={() => setSeleccionada(r.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg border bg-surface p-3 text-left shadow-card transition-colors',
                  seleccionada === r.id ? 'border-action-500 bg-action-50' : 'border-border hover:bg-surface-alt',
                )}
              >
                <span className="text-2xl" aria-hidden>{r.emoji}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-text">{r.producto}</div>
                  <div className="num text-xs text-text-muted">
                    Costo {formatCurrency(r.costo)} · {r.insumos} insumos
                  </div>
                </div>
                <Badge tone={m >= 70 ? 'success' : 'warning'}>{m}%</Badge>
              </button>
            );
          })}
        </div>

        {/* Detalle de la receta */}
        <div className="space-y-4 lg:col-span-2">
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

          <Card className="p-4">
            <div className="flex items-center gap-2">
              <BookOpen size={18} className="text-brand-500" />
              <h2 className="font-display text-lg font-semibold text-text">
                Ingredientes de “{receta.producto}”
              </h2>
            </div>
            <table className="mt-3 w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-text-muted">
                  <th className="pb-2 font-medium">Insumo</th>
                  <th className="pb-2 text-right font-medium">Cantidad</th>
                  <th className="pb-2 text-right font-medium">Merma</th>
                  <th className="pb-2 text-right font-medium">Costo</th>
                </tr>
              </thead>
              <tbody>
                {recetaLatte.map((it, i) => (
                  <tr key={i} className="border-b border-border/60 last:border-0">
                    <td className="py-2 font-medium text-text">{it.insumo}</td>
                    <td className="num py-2 text-right text-text-muted">{it.cantidad}</td>
                    <td className="num py-2 text-right text-text-muted">{it.merma}</td>
                    <td className="num py-2 text-right font-semibold text-text">{formatCurrency(it.costo)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-xs text-text-muted">
              El costo se recalcula automáticamente cuando cambia el precio de un insumo en inventario.
              Al facturar, estos insumos se descuentan por explosión de receta.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
