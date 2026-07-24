import { useMemo, useRef, useState } from 'react';
import { Search, Plus, Minus, LayoutGrid, ReceiptText, CreditCard, Percent, Trash2, type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';
import { formatCurrency } from '@/lib/format';
import { categorias, productos, type Producto } from '@/mock/data';

interface Linea {
  producto: Producto;
  cantidad: number;
}

const IVA = 0.12; // Guatemala

export function PosPage() {
  const [catActiva, setCatActiva] = useState<string>('all');
  const [busqueda, setBusqueda] = useState('');
  const [lineas, setLineas] = useState<Linea[]>([
    { producto: productos.find((p) => p.id === 'p-latte')!, cantidad: 2 },
    { producto: productos.find((p) => p.id === 'p-croissant')!, cantidad: 1 },
  ]);
  const buscadorRef = useRef<HTMLInputElement>(null);

  const visibles = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return productos.filter((p) => {
      const okCat = catActiva === 'all' || p.categoriaId === catActiva;
      const okQ = !q || p.nombre.toLowerCase().includes(q);
      return okCat && okQ;
    });
  }, [catActiva, busqueda]);

  function agregar(producto: Producto) {
    setLineas((prev) => {
      const i = prev.findIndex((l) => l.producto.id === producto.id);
      if (i >= 0) {
        const copia = [...prev];
        copia[i] = { ...copia[i], cantidad: copia[i].cantidad + 1 };
        return copia;
      }
      return [...prev, { producto, cantidad: 1 }];
    });
  }

  function cambiarCantidad(id: string, delta: number) {
    setLineas((prev) =>
      prev
        .map((l) => (l.producto.id === id ? { ...l, cantidad: l.cantidad + delta } : l))
        .filter((l) => l.cantidad > 0),
    );
  }

  const subtotal = lineas.reduce((s, l) => s + l.producto.precio * l.cantidad, 0);
  const impuesto = subtotal * IVA;
  const total = subtotal + impuesto;
  const totalItems = lineas.reduce((s, l) => s + l.cantidad, 0);

  return (
    <div className="flex h-full flex-col lg:flex-row">
      {/* Panel productos */}
      <section className="flex min-w-0 flex-1 flex-col border-b border-border lg:border-b-0 lg:border-r">
        {/* Buscador + categorías */}
        <div className="space-y-3 border-b border-border bg-surface p-4">
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              ref={buscadorRef}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar producto…  (atajo: /)"
              className="h-11 w-full rounded-md border border-border bg-surface-alt pl-10 pr-4 text-base text-text placeholder:text-text-muted focus:outline-none"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto scroll-thin pb-1">
            <CatChip label="Todos" emoji="" icon={LayoutGrid} active={catActiva === 'all'} onClick={() => setCatActiva('all')} />
            {categorias.map((c) => (
              <CatChip
                key={c.id}
                label={c.nombre}
                emoji={c.emoji}
                active={catActiva === c.id}
                onClick={() => setCatActiva(c.id)}
              />
            ))}
          </div>
        </div>

        {/* Grid de productos */}
        <div className="min-h-0 flex-1 overflow-auto scroll-thin p-4">
          {visibles.length === 0 ? (
            <div className="grid h-full place-items-center text-center">
              <div>
                <Search size={40} className="mx-auto text-text-muted" />
                <p className="mt-2 font-medium text-text">Sin resultados para “{busqueda}”</p>
                <p className="text-sm text-text-muted">Prueba con otro término o cambia de categoría.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
              {visibles.map((p) => (
                <button
                  key={p.id}
                  onClick={() => agregar(p)}
                  className="group flex flex-col rounded-lg border border-border bg-surface p-3 text-left shadow-card transition-transform hover:-translate-y-0.5 hover:border-action-500"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-3xl" aria-hidden>{p.emoji}</span>
                    {p.destacado && <Badge tone="accent">Popular</Badge>}
                  </div>
                  <span className="mt-2 line-clamp-2 text-sm font-medium text-text">{p.nombre}</span>
                  <span className="num mt-1 text-lg font-semibold text-brand-700">
                    {formatCurrency(p.precio)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Ticket lateral */}
      <aside className="flex w-full shrink-0 flex-col bg-surface lg:w-96">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-text">Ticket actual</h2>
            <p className="text-xs text-text-muted">Mesa 4 · Mesero: Ana</p>
          </div>
          <Badge tone="action">{totalItems} art.</Badge>
        </div>

        {/* Líneas */}
        <div className="min-h-0 flex-1 overflow-auto scroll-thin p-2">
          {lineas.length === 0 ? (
            <div className="grid h-full place-items-center p-6 text-center">
              <div>
                <ReceiptText size={40} className="mx-auto text-text-muted" />
                <p className="mt-2 font-medium text-text">Ticket vacío</p>
                <p className="text-sm text-text-muted">Toca un producto para agregarlo.</p>
              </div>
            </div>
          ) : (
            <ul className="space-y-1">
              {lineas.map((l) => (
                <li key={l.producto.id} className="flex items-center gap-2 rounded-md p-2 hover:bg-surface-alt">
                  <span className="text-xl" aria-hidden>{l.producto.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-text">{l.producto.nombre}</div>
                    <div className="num text-xs text-text-muted">{formatCurrency(l.producto.precio)} c/u</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <StepBtn dir="down" onClick={() => cambiarCantidad(l.producto.id, -1)} />
                    <span className="num w-6 text-center text-sm font-semibold text-text">{l.cantidad}</span>
                    <StepBtn dir="up" onClick={() => cambiarCantidad(l.producto.id, 1)} />
                  </div>
                  <span className="num w-16 text-right text-sm font-semibold text-text">
                    {formatCurrency(l.producto.precio * l.cantidad)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Totales */}
        <div className="border-t border-border p-4">
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between text-text-muted">
              <dt>Subtotal</dt>
              <dd className="num">{formatCurrency(subtotal)}</dd>
            </div>
            <div className="flex justify-between text-text-muted">
              <dt>IVA (12%)</dt>
              <dd className="num">{formatCurrency(impuesto)}</dd>
            </div>
            <div className="mt-2 flex justify-between border-t border-border pt-2 text-lg font-semibold text-text">
              <dt>Total</dt>
              <dd className="num">{formatCurrency(total)}</dd>
            </div>
          </dl>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button variant="secondary" size="lg" disabled={lineas.length === 0}>
              <Percent size={18} /> Descuento
            </Button>
            <Button variant="secondary" size="lg" onClick={() => setLineas([])} disabled={lineas.length === 0}>
              <Trash2 size={18} /> Cancelar
            </Button>
          </div>
          <Button size="lg" className="mt-2 w-full" disabled={lineas.length === 0}>
            <CreditCard size={20} /> Cobrar · {formatCurrency(total)}
          </Button>
        </div>
      </aside>
    </div>
  );
}

function CatChip({
  label,
  emoji,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  emoji: string;
  icon?: LucideIcon;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
        active
          ? 'border-action-500 bg-action-50 text-action-700'
          : 'border-border bg-surface text-text-muted hover:bg-surface-sunk',
      )}
    >
      {Icon ? <Icon size={15} /> : <span aria-hidden>{emoji}</span>}
      {label}
    </button>
  );
}

function StepBtn({ dir, onClick }: { dir: 'up' | 'down'; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="grid h-7 w-7 place-items-center rounded-md border border-border bg-surface text-text hover:bg-surface-sunk"
      aria-label={dir === 'up' ? 'Aumentar' : 'Disminuir'}
    >
      {dir === 'up' ? <Plus size={14} /> : <Minus size={14} />}
    </button>
  );
}
