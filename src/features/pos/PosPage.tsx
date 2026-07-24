import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  Plus,
  Minus,
  LayoutGrid,
  ReceiptText,
  CreditCard,
  Banknote,
  Percent,
  Trash2,
  X,
  CheckCircle2,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/cn';
import { formatCurrency } from '@/lib/format';
import { categorias, productos, type Producto } from '@/mock/data';

interface Linea {
  producto: Producto;
  cantidad: number;
}

type MetodoPago = 'efectivo' | 'tarjeta';

interface Venta {
  folio: string;
  metodo: MetodoPago;
  total: number;
  recibido: number;
  cambio: number;
}

/** Denominaciones frecuentes en quetzales para el pago en efectivo. */
const DENOMINACIONES = [50, 100, 200];

export function PosPage() {
  const [catActiva, setCatActiva] = useState<string>('all');
  const [busqueda, setBusqueda] = useState('');
  const [lineas, setLineas] = useState<Linea[]>([]);
  const [descuento, setDescuento] = useState(0);
  const [cobroAbierto, setCobroAbierto] = useState(false);
  const [descuentoAbierto, setDescuentoAbierto] = useState(false);
  const buscadorRef = useRef<HTMLInputElement>(null);

  // Atajo "/" para saltar al buscador desde cualquier parte de la vista.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement;
      if (e.key === '/' && t.tagName !== 'INPUT' && t.tagName !== 'TEXTAREA') {
        e.preventDefault();
        buscadorRef.current?.focus();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

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
  const descuentoAplicado = Math.min(descuento, subtotal);
  const total = subtotal - descuentoAplicado;
  const totalItems = lineas.reduce((s, l) => s + l.cantidad, 0);

  function limpiarTicket() {
    setLineas([]);
    setDescuento(0);
  }

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
              className="h-11 w-full rounded-md border border-border bg-surface-alt pl-10 pr-4 text-base text-text placeholder:text-text-muted focus:border-action-500 focus:outline-none focus:ring-2 focus:ring-action-500/40"
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
                  className="group flex flex-col overflow-hidden rounded-lg border border-border bg-surface text-left shadow-card transition-transform hover:-translate-y-0.5 hover:border-action-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-500 active:scale-[.98]"
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-alt">
                    {p.imagen ? (
                      <img
                        src={p.imagen}
                        alt={p.nombre}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <span className="grid h-full w-full place-items-center text-4xl" aria-hidden>
                        {p.emoji}
                      </span>
                    )}
                    {p.destacado && (
                      <span className="absolute left-2 top-2">
                        <Badge tone="accent">Popular</Badge>
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col p-3">
                    <span className="line-clamp-2 text-sm font-medium text-text">{p.nombre}</span>
                    <span className="num mt-1 text-lg font-semibold text-brand-700">
                      {formatCurrency(p.precio)}
                    </span>
                  </div>
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
            {descuentoAplicado > 0 && (
              <div className="flex justify-between text-success">
                <dt>Descuento</dt>
                <dd className="num">−{formatCurrency(descuentoAplicado)}</dd>
              </div>
            )}
            <div className="mt-2 flex justify-between border-t border-border pt-2 text-lg font-semibold text-text">
              <dt>Total</dt>
              <dd className="num">{formatCurrency(total)}</dd>
            </div>
          </dl>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              size="lg"
              disabled={lineas.length === 0}
              onClick={() => setDescuentoAbierto(true)}
            >
              <Percent size={18} /> {descuentoAplicado > 0 ? 'Editar dcto.' : 'Descuento'}
            </Button>
            <Button variant="secondary" size="lg" onClick={limpiarTicket} disabled={lineas.length === 0}>
              <Trash2 size={18} /> Cancelar
            </Button>
          </div>
          <Button
            size="lg"
            className="mt-2 w-full"
            disabled={lineas.length === 0}
            onClick={() => setCobroAbierto(true)}
          >
            <CreditCard size={20} /> Cobrar · {formatCurrency(total)}
          </Button>
        </div>
      </aside>

      {descuentoAbierto && (
        <DescuentoModal
          subtotal={subtotal}
          actual={descuento}
          onCerrar={() => setDescuentoAbierto(false)}
          onAplicar={(monto) => {
            setDescuento(monto);
            setDescuentoAbierto(false);
          }}
        />
      )}

      {cobroAbierto && (
        <CobroModal
          total={total}
          onCerrar={() => setCobroAbierto(false)}
          onCompletar={() => {
            limpiarTicket();
            setCobroAbierto(false);
          }}
        />
      )}
    </div>
  );
}

function CobroModal({
  total,
  onCerrar,
  onCompletar,
}: {
  total: number;
  onCerrar: () => void;
  onCompletar: () => void;
}) {
  const [metodo, setMetodo] = useState<MetodoPago>('efectivo');
  const [recibido, setRecibido] = useState('');
  const [venta, setVenta] = useState<Venta | null>(null);

  const recibidoNum = parseFloat(recibido) || 0;
  const cambio = recibidoNum - total;
  const puedeConfirmar = metodo === 'tarjeta' || recibidoNum >= total;

  function confirmar() {
    setVenta({
      folio: `#${Math.floor(1000 + Math.random() * 9000)}`,
      metodo,
      total,
      recibido: metodo === 'efectivo' ? recibidoNum : total,
      cambio: metodo === 'efectivo' ? cambio : 0,
    });
  }

  return (
    <Modal onClose={venta ? onCompletar : onCerrar} ariaLabel="Cobro" className="w-full max-w-md">
      {venta ? (
          /* ---- Comprobante de venta ---- */
          <div className="p-6 text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success/15 text-success">
              <CheckCircle2 size={36} />
            </span>
            <h3 className="mt-4 font-display text-2xl font-semibold text-text">Venta cobrada</h3>
            <p className="text-sm text-text-muted">
              Folio {venta.folio} · {venta.metodo === 'efectivo' ? 'Efectivo' : 'Tarjeta'}
            </p>

            <dl className="mt-5 space-y-1.5 rounded-lg bg-surface-alt p-4 text-left text-sm">
              <div className="flex justify-between">
                <dt className="text-text-muted">Total</dt>
                <dd className="num font-semibold text-text">{formatCurrency(venta.total)}</dd>
              </div>
              {venta.metodo === 'efectivo' && (
                <>
                  <div className="flex justify-between">
                    <dt className="text-text-muted">Recibido</dt>
                    <dd className="num text-text">{formatCurrency(venta.recibido)}</dd>
                  </div>
                  <div className="flex justify-between border-t border-border pt-1.5 text-base">
                    <dt className="font-medium text-text">Cambio</dt>
                    <dd className="num font-bold text-success">{formatCurrency(venta.cambio)}</dd>
                  </div>
                </>
              )}
            </dl>

            <Button size="lg" className="mt-5 w-full" onClick={onCompletar}>
              Nueva venta
            </Button>
          </div>
        ) : (
          /* ---- Selección de pago ---- */
          <>
            <header className="flex items-center justify-between border-b border-border p-4">
              <div>
                <h3 className="font-display text-lg font-semibold text-text">Cobrar</h3>
                <p className="num text-sm text-text-muted">Total a pagar: {formatCurrency(total)}</p>
              </div>
              <button
                onClick={onCerrar}
                aria-label="Cerrar"
                className="grid h-9 w-9 place-items-center rounded-md border border-border hover:bg-surface-sunk"
              >
                <X size={18} />
              </button>
            </header>

            <div className="space-y-4 p-4">
              {/* Método de pago */}
              <div className="grid grid-cols-2 gap-2">
                <MetodoBtn
                  activo={metodo === 'efectivo'}
                  icon={Banknote}
                  label="Efectivo"
                  onClick={() => setMetodo('efectivo')}
                />
                <MetodoBtn
                  activo={metodo === 'tarjeta'}
                  icon={CreditCard}
                  label="Tarjeta"
                  onClick={() => setMetodo('tarjeta')}
                />
              </div>

              {metodo === 'efectivo' ? (
                <div className="space-y-3">
                  <div>
                    <label htmlFor="recibido" className="mb-1 block text-sm font-medium text-text">
                      Efectivo recibido
                    </label>
                    <input
                      id="recibido"
                      type="number"
                      inputMode="decimal"
                      min={0}
                      autoFocus
                      value={recibido}
                      onChange={(e) => setRecibido(e.target.value)}
                      placeholder="0.00"
                      className="num h-12 w-full rounded-md border border-border bg-surface-alt px-3 text-right text-xl font-semibold text-text focus:border-action-500 focus:outline-none"
                    />
                  </div>

                  {/* Montos rápidos */}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setRecibido(String(total))}
                      className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-text hover:bg-surface-sunk"
                    >
                      Exacto
                    </button>
                    {DENOMINACIONES.filter((d) => d >= total).map((d) => (
                      <button
                        key={d}
                        onClick={() => setRecibido(String(d))}
                        className="num rounded-md border border-border px-3 py-1.5 text-sm font-medium text-text hover:bg-surface-sunk"
                      >
                        {formatCurrency(d)}
                      </button>
                    ))}
                  </div>

                  {/* Cambio */}
                  <div className="flex items-center justify-between rounded-lg bg-surface-alt px-4 py-3">
                    <span className="text-sm font-medium text-text-muted">Cambio</span>
                    <span className={cn('num text-xl font-bold', cambio >= 0 ? 'text-success' : 'text-text-muted')}>
                      {formatCurrency(Math.max(0, cambio))}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-border p-6 text-center">
                  <CreditCard size={32} className="mx-auto text-text-muted" />
                  <p className="mt-2 text-sm text-text-muted">
                    Pasa o inserta la tarjeta en la terminal y aprueba el pago.
                  </p>
                </div>
              )}

              <Button size="lg" className="w-full" disabled={!puedeConfirmar} onClick={confirmar}>
                <CheckCircle2 size={20} /> Confirmar pago · {formatCurrency(total)}
              </Button>
            </div>
          </>
        )}
    </Modal>
  );
}

function DescuentoModal({
  subtotal,
  actual,
  onCerrar,
  onAplicar,
}: {
  subtotal: number;
  actual: number;
  onCerrar: () => void;
  onAplicar: (monto: number) => void;
}) {
  const [tipo, setTipo] = useState<'pct' | 'fijo'>('pct');
  const [valor, setValor] = useState(actual > 0 ? String(actual) : '');

  const valorNum = parseFloat(valor) || 0;
  const monto = tipo === 'pct' ? (subtotal * valorNum) / 100 : valorNum;
  const montoAplicado = Math.min(Math.max(0, monto), subtotal);
  const totalConDcto = subtotal - montoAplicado;

  return (
    <Modal onClose={onCerrar} ariaLabel="Aplicar descuento" className="w-full max-w-sm">
      <header className="flex items-center justify-between border-b border-border p-4">
          <h3 className="font-display text-lg font-semibold text-text">Descuento</h3>
          <button
            onClick={onCerrar}
            aria-label="Cerrar"
            className="grid h-9 w-9 place-items-center rounded-md border border-border hover:bg-surface-sunk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-500"
          >
            <X size={18} />
          </button>
        </header>

        <div className="space-y-4 p-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setTipo('pct')}
              className={cn(
                'rounded-lg border p-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-500',
                tipo === 'pct'
                  ? 'border-action-500 bg-action-50 text-action-700'
                  : 'border-border bg-surface text-text-muted hover:bg-surface-sunk',
              )}
            >
              Porcentaje %
            </button>
            <button
              onClick={() => setTipo('fijo')}
              className={cn(
                'rounded-lg border p-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-500',
                tipo === 'fijo'
                  ? 'border-action-500 bg-action-50 text-action-700'
                  : 'border-border bg-surface text-text-muted hover:bg-surface-sunk',
              )}
            >
              Monto fijo Q
            </button>
          </div>

          <div>
            <label htmlFor="dcto-valor" className="mb-1 block text-sm font-medium text-text">
              {tipo === 'pct' ? 'Porcentaje a descontar' : 'Monto a descontar'}
            </label>
            <input
              id="dcto-valor"
              type="number"
              inputMode="decimal"
              min={0}
              max={tipo === 'pct' ? 100 : subtotal}
              autoFocus
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder={tipo === 'pct' ? '0 %' : '0.00'}
              className="num h-12 w-full rounded-md border border-border bg-surface-alt px-3 text-right text-xl font-semibold text-text focus:border-action-500 focus:outline-none focus:ring-2 focus:ring-action-500/40"
            />
          </div>

          <dl className="space-y-1 rounded-lg bg-surface-alt p-3 text-sm">
            <div className="flex justify-between text-success">
              <dt>Descuento</dt>
              <dd className="num">−{formatCurrency(montoAplicado)}</dd>
            </div>
            <div className="flex justify-between font-semibold text-text">
              <dt>Total con descuento</dt>
              <dd className="num">{formatCurrency(totalConDcto)}</dd>
            </div>
          </dl>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" size="lg" onClick={() => onAplicar(0)}>
              Quitar
            </Button>
            <Button size="lg" onClick={() => onAplicar(montoAplicado)}>
              Aplicar
            </Button>
          </div>
        </div>
    </Modal>
  );
}

function MetodoBtn({
  activo,
  icon: Icon,
  label,
  onClick,
}: {
  activo: boolean;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-1.5 rounded-lg border p-4 text-sm font-semibold transition-colors',
        activo
          ? 'border-action-500 bg-action-50 text-action-700'
          : 'border-border bg-surface text-text-muted hover:bg-surface-sunk',
      )}
    >
      <Icon size={24} />
      {label}
    </button>
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
        'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-500',
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
      className="grid h-10 w-10 place-items-center rounded-md border border-border bg-surface text-text hover:bg-surface-sunk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-500"
      aria-label={dir === 'up' ? 'Aumentar' : 'Disminuir'}
    >
      {dir === 'up' ? <Plus size={16} /> : <Minus size={16} />}
    </button>
  );
}
