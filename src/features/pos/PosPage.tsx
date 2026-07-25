import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Plus,
  Minus,
  LayoutGrid,
  ReceiptText,
  CreditCard,
  Banknote,
  Percent,
  Tag,
  Trash2,
  X,
  Check,
  CheckCircle2,
  ChefHat,
  Utensils,
  Store,
  ShoppingBag,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { cn } from '@/lib/cn';
import { formatCurrency } from '@/lib/format';
import { useToast } from '@/lib/toast';
import { useOperacion, estacionDe, type TipoVenta, type MetodoPago, type LineaTicket } from '@/lib/operacion';
import {
  promocionesSeed,
  gruposModificadores,
  type Producto,
  type Promocion,
  type GrupoModificador,
  type OpcionModificador,
} from '@/mock/data';

/** Calcula el descuento en Q que una promoción aplica sobre un subtotal. */
function descuentoPromo(promo: Promocion, subtotal: number): number {
  switch (promo.tipo) {
    case 'porcentaje': return (subtotal * promo.valor) / 100;
    case 'monto': return promo.valor;
    case 'combo': return Math.max(0, subtotal - promo.valor);
    case '2x1': return subtotal / 2; // aproximación para la demo: mitad del ticket
  }
}

interface Linea {
  /** Id único de línea: dos veces el mismo producto con distintos modificadores son líneas distintas. */
  uid: string;
  producto: Producto;
  cantidad: number;
  /** Ajuste de precio unitario por los modificadores elegidos. */
  extraPrecio: number;
  /** Texto legible de los modificadores, para el ticket y la comanda. */
  nota?: string;
}

const tipoVentaInfo: Record<TipoVenta, { label: string; icon: LucideIcon }> = {
  mesa: { label: 'Mesa', icon: Utensils },
  mostrador: { label: 'Mostrador', icon: Store },
  llevar: { label: 'Para llevar', icon: ShoppingBag },
};

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
  const [params, setParams] = useSearchParams();
  const { mesas, cuentas, productos, categorias, enviarComanda, cobrar, pedirCuenta } = useOperacion();

  const mesaId = params.get('mesa') ?? undefined;
  const mesa = mesaId ? mesas.find((m) => m.id === mesaId) : undefined;
  const tipoVenta: TipoVenta = mesaId ? 'mesa' : params.get('tipo') === 'llevar' ? 'llevar' : 'mostrador';

  const [catActiva, setCatActiva] = useState<string>('all');
  const [busqueda, setBusqueda] = useState('');
  const [lineas, setLineas] = useState<Linea[]>([]);
  const [descuento, setDescuento] = useState(0);
  const [promo, setPromo] = useState<Promocion | null>(null);
  const [cobroAbierto, setCobroAbierto] = useState(false);
  const [descuentoAbierto, setDescuentoAbierto] = useState(false);
  const [promoAbierta, setPromoAbierta] = useState(false);
  const [dividirAbierto, setDividirAbierto] = useState(false);
  // Producto cuyo modal de modificadores está abierto.
  const [prodModificar, setProdModificar] = useState<Producto | null>(null);
  const buscadorRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const confirm = useConfirm();

  // Cuenta ya enviada a cocina para esta mesa (líneas acumuladas en el store).
  const cuenta = mesaId ? cuentas[mesaId] : undefined;
  const yaEnviado = cuenta?.lineas ?? [];
  const totalEnviado = yaEnviado.reduce((s, l) => s + l.precio * l.cantidad, 0);

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
  }, [productos, catActiva, busqueda]);

  /** Al tocar un producto: si tiene modificadores abre el modal, si no lo agrega directo. */
  function seleccionar(producto: Producto) {
    if (producto.modificadores && producto.modificadores.length > 0) {
      setProdModificar(producto);
    } else {
      agregarLinea(producto, 0);
    }
  }

  /** Agrega una línea; combina con una existente idéntica (mismo producto y modificadores). */
  function agregarLinea(producto: Producto, extraPrecio: number, nota?: string) {
    setLineas((prev) => {
      const i = prev.findIndex((l) => l.producto.id === producto.id && l.nota === nota && l.extraPrecio === extraPrecio);
      if (i >= 0) {
        const copia = [...prev];
        copia[i] = { ...copia[i], cantidad: copia[i].cantidad + 1 };
        return copia;
      }
      return [...prev, { uid: `ln-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, producto, cantidad: 1, extraPrecio, nota }];
    });
  }

  function cambiarCantidad(uid: string, delta: number) {
    setLineas((prev) =>
      prev
        .map((l) => (l.uid === uid ? { ...l, cantidad: l.cantidad + delta } : l))
        .filter((l) => l.cantidad > 0),
    );
  }

  // Precio unitario de una línea = precio base + ajuste de modificadores.
  const precioLinea = (l: Linea) => l.producto.precio + l.extraPrecio;
  const subtotal = lineas.reduce((s, l) => s + precioLinea(l) * l.cantidad, 0);
  const promoDesc = promo ? descuentoPromo(promo, subtotal) : 0;
  // El total nunca baja de 0; el descuento manual y la promo se suman.
  const descuentoAplicado = Math.min(descuento + promoDesc, subtotal);
  const total = subtotal - descuentoAplicado;
  const totalItems = lineas.reduce((s, l) => s + l.cantidad, 0);

  function limpiarTicket() {
    setLineas([]);
    setDescuento(0);
    setPromo(null);
  }

  function aplicarPromo(p: Promocion) {
    setPromo(p);
    setPromoAbierta(false);
    toast.exito(`Promoción "${p.nombre}" aplicada.`);
  }

  async function cancelarTicket() {
    const ok = await confirm({
      titulo: 'Cancelar ticket',
      mensaje: `Se quitarán ${totalItems} artículo${totalItems === 1 ? '' : 's'} del ticket actual.`,
      confirmar: 'Sí, cancelar',
      cancelar: 'Seguir con el ticket',
      peligro: true,
    });
    if (!ok) return;
    limpiarTicket();
    toast.info('Ticket cancelado.');
  }

  /** Convierte las líneas de la UI al formato del store, con su estación de destino. */
  function lineasParaStore(): LineaTicket[] {
    return lineas.map((l) => ({
      productoId: l.producto.id,
      nombre: l.producto.nombre,
      precio: precioLinea(l),
      cantidad: l.cantidad,
      emoji: l.producto.emoji,
      estacion: estacionDe(l.producto.id),
      nota: l.nota,
    }));
  }

  /** Venta en MESA: envía la comanda a cocina y deja la cuenta abierta (post-pago). */
  function enviarACocina() {
    if (!mesa) return;
    const folio = enviarComanda(mesa.nombre, lineasParaStore(), mesa.id);
    limpiarTicket();
    toast.exito(`Comanda ${folio} enviada a cocina. Inventario descontado.`);
  }

  /** Mesa que pide la cuenta pasa a estado "cuenta" antes de ir a caja. */
  function marcarPideCuenta() {
    if (!mesa) return;
    pedirCuenta(mesa.id);
    toast.info(`${mesa.nombre} pidió la cuenta. Cóbrala cuando el cliente pague.`);
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
                  onClick={() => seleccionar(p)}
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
            <div className="flex items-center gap-2">
              {(() => {
                const Icono = tipoVentaInfo[tipoVenta].icon;
                return <Icono size={18} className="text-brand-500" />;
              })()}
              <h2 className="font-display text-lg font-semibold text-text">
                {mesa ? mesa.nombre : tipoVentaInfo[tipoVenta].label}
              </h2>
            </div>
            <p className="text-xs text-text-muted">
              {mesa
                ? `${cuenta?.mesero ?? mesa.mesero ?? 'Mesero'} · cuenta abierta`
                : tipoVenta === 'llevar'
                  ? 'Pedido para llevar · se cobra al confirmar'
                  : 'Venta en mostrador · se cobra al confirmar'}
            </p>
          </div>
          <Badge tone="action">{totalItems} art.</Badge>
        </div>

        {/* Consumo ya enviado a cocina (solo mesas) */}
        {mesa && yaEnviado.length > 0 && (
          <div className="border-b border-border bg-surface-alt px-4 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">Ya en cocina</p>
            <ul className="mt-1 space-y-0.5">
              {yaEnviado.map((l, i) => (
                <li key={i} className="flex justify-between text-xs text-text-muted">
                  <span>
                    <span className="num">{l.cantidad}×</span> {l.nombre}
                  </span>
                  <span className="num">{formatCurrency(l.precio * l.cantidad)}</span>
                </li>
              ))}
              <li className="flex justify-between border-t border-border pt-1 text-xs font-semibold text-text">
                <span>Subtotal en cuenta</span>
                <span className="num">{formatCurrency(totalEnviado)}</span>
              </li>
            </ul>
          </div>
        )}

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
                <li key={l.uid} className="flex items-start gap-2 rounded-md p-2 hover:bg-surface-alt">
                  <span className="mt-0.5 text-xl" aria-hidden>{l.producto.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-text">{l.producto.nombre}</div>
                    {l.nota && <div className="text-xs italic text-accent-600">{l.nota}</div>}
                    <div className="num text-xs text-text-muted">{formatCurrency(precioLinea(l))} c/u</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <StepBtn dir="down" onClick={() => cambiarCantidad(l.uid, -1)} />
                    <span className="num w-6 text-center text-sm font-semibold text-text">{l.cantidad}</span>
                    <StepBtn dir="up" onClick={() => cambiarCantidad(l.uid, 1)} />
                  </div>
                  <span className="num w-16 text-right text-sm font-semibold text-text">
                    {formatCurrency(precioLinea(l) * l.cantidad)}
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
            {promo && promoDesc > 0 && (
              <div className="flex items-center justify-between text-accent-600">
                <dt className="inline-flex items-center gap-1">
                  <Tag size={13} /> {promo.nombre}
                  <button onClick={() => setPromo(null)} aria-label="Quitar promoción" className="ml-1 text-text-muted hover:text-danger">
                    <X size={13} />
                  </button>
                </dt>
                <dd className="num">−{formatCurrency(Math.min(promoDesc, subtotal))}</dd>
              </div>
            )}
            {descuento > 0 && (
              <div className="flex justify-between text-success">
                <dt>Descuento manual</dt>
                <dd className="num">−{formatCurrency(descuento)}</dd>
              </div>
            )}
            <div className="mt-2 flex justify-between border-t border-border pt-2 text-lg font-semibold text-text">
              <dt>Total</dt>
              <dd className="num">{formatCurrency(total)}</dd>
            </div>
          </dl>

          <div className="mt-4 grid grid-cols-3 gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={lineas.length === 0}
              onClick={() => setPromoAbierta(true)}
            >
              <Tag size={16} /> Promo
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={lineas.length === 0}
              onClick={() => setDescuentoAbierto(true)}
            >
              <Percent size={16} /> {descuento > 0 ? 'Dcto.' : 'Dcto.'}
            </Button>
            <Button variant="secondary" size="sm" onClick={cancelarTicket} disabled={lineas.length === 0}>
              <Trash2 size={16} /> Cancelar
            </Button>
          </div>

          {mesa ? (
            /* ---- Venta en MESA (post-pago) ---- */
            <div className="mt-2 space-y-2">
              <Button size="lg" className="w-full" disabled={lineas.length === 0} onClick={enviarACocina}>
                <ChefHat size={20} /> Enviar a cocina{lineas.length > 0 && ` · ${formatCurrency(total)}`}
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="secondary"
                  size="lg"
                  disabled={mesa.estado === 'cuenta' || totalEnviado === 0}
                  onClick={marcarPideCuenta}
                >
                  <ReceiptText size={18} /> Pedir cuenta
                </Button>
                <Button
                  size="lg"
                  disabled={totalEnviado === 0 && lineas.length === 0}
                  onClick={() => setCobroAbierto(true)}
                >
                  <CreditCard size={18} /> Cobrar
                </Button>
              </div>
              <Button
                variant="secondary"
                size="lg"
                className="w-full"
                disabled={totalEnviado === 0}
                onClick={() => setDividirAbierto(true)}
              >
                <Users size={18} /> Dividir cuenta
              </Button>
            </div>
          ) : (
            /* ---- Venta en MOSTRADOR o PARA LLEVAR (pre-pago) ---- */
            <Button
              size="lg"
              className="mt-2 w-full"
              disabled={lineas.length === 0}
              onClick={() => setCobroAbierto(true)}
            >
              <CreditCard size={20} /> Cobrar · {formatCurrency(total)}
            </Button>
          )}
        </div>
      </aside>

      {prodModificar && (
        <ModificadoresModal
          producto={prodModificar}
          onCerrar={() => setProdModificar(null)}
          onAgregar={(extra, nota) => {
            agregarLinea(prodModificar, extra, nota);
            setProdModificar(null);
          }}
        />
      )}

      {promoAbierta && (
        <PromoSelectorModal
          subtotal={subtotal}
          onCerrar={() => setPromoAbierta(false)}
          onAplicar={aplicarPromo}
        />
      )}

      {dividirAbierto && mesa && (
        <DividirCuentaModal
          lineas={yaEnviado}
          total={totalEnviado}
          onCerrar={() => setDividirAbierto(false)}
        />
      )}

      {descuentoAbierto && (
        <DescuentoModal
          subtotal={subtotal}
          actual={descuento}
          onCerrar={() => setDescuentoAbierto(false)}
          onAplicar={(monto) => {
            setDescuento(monto);
            setDescuentoAbierto(false);
            toast.exito(monto > 0 ? `Descuento de ${formatCurrency(monto)} aplicado.` : 'Descuento retirado.');
          }}
        />
      )}

      {cobroAbierto && (
        <CobroModal
          total={mesa ? totalEnviado + total : total}
          registrarCobro={(metodo) => {
            // Pre-pago (mostrador/llevar): la comanda va a cocina al cobrar.
            if (!mesa && lineas.length > 0) {
              const origen = tipoVenta === 'llevar' ? 'Para llevar' : 'Mostrador';
              enviarComanda(origen, lineasParaStore());
            }
            // Mesa con líneas nuevas aún sin enviar: mándalas también.
            if (mesa && lineas.length > 0) {
              enviarComanda(mesa.nombre, lineasParaStore(), mesa.id);
            }
            const montoTotal = mesa ? totalEnviado + total : total;
            return cobrar({ mesaId: mesa?.id, tipoVenta, metodo, total: montoTotal });
          }}
          onVentaCobrada={(v) =>
            toast.exito(`Venta ${v.folio} cobrada · ${formatCurrency(v.total)}`)
          }
          onCerrar={() => setCobroAbierto(false)}
          onCompletar={() => {
            limpiarTicket();
            setCobroAbierto(false);
            // Al cobrar una mesa, vuelve al mapa de mesas.
            if (mesa) setParams({}, { replace: true });
          }}
        />
      )}
    </div>
  );
}

function CobroModal({
  total,
  registrarCobro,
  onCerrar,
  onCompletar,
  onVentaCobrada,
}: {
  total: number;
  /** Aplica el cobro en el store y devuelve el folio real de la venta. */
  registrarCobro: (metodo: MetodoPago) => string;
  onCerrar: () => void;
  onCompletar: () => void;
  onVentaCobrada: (venta: Venta) => void;
}) {
  const [metodo, setMetodo] = useState<MetodoPago>('efectivo');
  const [recibido, setRecibido] = useState('');
  const [venta, setVenta] = useState<Venta | null>(null);

  const recibidoNum = parseFloat(recibido) || 0;
  const cambio = recibidoNum - total;
  const puedeConfirmar = metodo === 'tarjeta' || recibidoNum >= total;

  function confirmar() {
    const folio = registrarCobro(metodo);
    const nueva: Venta = {
      folio,
      metodo,
      total,
      recibido: metodo === 'efectivo' ? recibidoNum : total,
      cambio: metodo === 'efectivo' ? cambio : 0,
    };
    setVenta(nueva);
    onVentaCobrada(nueva);
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

function DividirCuentaModal({
  lineas,
  total,
  onCerrar,
}: {
  lineas: LineaTicket[];
  total: number;
  onCerrar: () => void;
}) {
  const [modo, setModo] = useState<'iguales' | 'producto'>('iguales');
  const [personas, setPersonas] = useState(2);

  // Modo "por producto": expandimos por unidad para poder asignar cada una.
  const unidades = useMemo(
    () =>
      lineas.flatMap((l, li) =>
        Array.from({ length: l.cantidad }, (_, ui) => ({
          key: `${li}-${ui}`,
          nombre: l.nombre,
          precio: l.precio,
        })),
      ),
    [lineas],
  );
  // asignacion[key] = índice de pagador (0..personas-1)
  const [asignacion, setAsignacion] = useState<Record<string, number>>({});

  const porPersonaIgual = total / personas;

  // Totales por pagador en modo producto.
  const totalesProducto = Array.from({ length: personas }, (_, p) =>
    unidades.filter((u) => asignacion[u.key] === p).reduce((s, u) => s + u.precio, 0),
  );
  const sinAsignar = unidades.filter((u) => asignacion[u.key] === undefined).length;

  return (
    <Modal onClose={onCerrar} ariaLabel="Dividir cuenta" className="w-full max-w-lg">
      <header className="flex items-center justify-between border-b border-border p-4">
        <div>
          <h3 className="font-display text-lg font-semibold text-text">Dividir cuenta</h3>
          <p className="num text-sm text-text-muted">Total: {formatCurrency(total)}</p>
        </div>
        <button
          onClick={onCerrar}
          aria-label="Cerrar"
          className="grid h-9 w-9 place-items-center rounded-md border border-border hover:bg-surface-sunk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-500"
        >
          <X size={18} />
        </button>
      </header>

      <div className="space-y-4 p-4">
        {/* Selector de modo */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setModo('iguales')}
            className={cn(
              'rounded-lg border p-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-500',
              modo === 'iguales' ? 'border-action-500 bg-action-50 text-action-700' : 'border-border bg-surface text-text-muted hover:bg-surface-sunk',
            )}
          >
            Partes iguales
          </button>
          <button
            onClick={() => setModo('producto')}
            className={cn(
              'rounded-lg border p-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-500',
              modo === 'producto' ? 'border-action-500 bg-action-50 text-action-700' : 'border-border bg-surface text-text-muted hover:bg-surface-sunk',
            )}
          >
            Por producto
          </button>
        </div>

        {/* Número de personas */}
        <div className="flex items-center justify-between rounded-lg bg-surface-alt px-4 py-3">
          <span className="text-sm font-medium text-text">¿Entre cuántas personas?</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPersonas((n) => Math.max(2, n - 1))}
              aria-label="Menos personas"
              className="grid h-8 w-8 place-items-center rounded-md border border-border hover:bg-surface-sunk"
            >
              <Minus size={16} />
            </button>
            <span className="num w-6 text-center text-lg font-semibold text-text">{personas}</span>
            <button
              onClick={() => setPersonas((n) => Math.min(8, n + 1))}
              aria-label="Más personas"
              className="grid h-8 w-8 place-items-center rounded-md border border-border hover:bg-surface-sunk"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {modo === 'iguales' ? (
          <div className="rounded-lg border border-action-500 bg-action-50/40 p-4 text-center">
            <p className="text-sm text-text-muted">Cada persona paga</p>
            <p className="num mt-1 text-3xl font-semibold text-action-700">{formatCurrency(porPersonaIgual)}</p>
            <p className="mt-1 text-xs text-text-muted">{personas} × {formatCurrency(porPersonaIgual)} = {formatCurrency(total)}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-text-muted">
              Toca cada producto para asignarlo a una persona.
              {sinAsignar > 0 && <span className="text-warning"> Quedan {sinAsignar} sin asignar.</span>}
            </p>
            <ul className="max-h-48 space-y-1.5 overflow-auto scroll-thin">
              {unidades.map((u) => {
                const asignado = asignacion[u.key];
                return (
                  <li key={u.key} className="flex items-center justify-between gap-2 rounded-md bg-surface-alt px-3 py-2">
                    <span className="min-w-0 flex-1 truncate text-sm text-text">{u.nombre}</span>
                    <span className="num text-xs text-text-muted">{formatCurrency(u.precio)}</span>
                    <div className="flex gap-1">
                      {Array.from({ length: personas }, (_, p) => (
                        <button
                          key={p}
                          onClick={() => setAsignacion((prev) => ({ ...prev, [u.key]: p }))}
                          className={cn(
                            'num grid h-7 w-7 place-items-center rounded-md border text-xs font-semibold transition-colors',
                            asignado === p ? 'border-action-500 bg-action-500 text-text-invert' : 'border-border text-text-muted hover:bg-surface-sunk',
                          )}
                          aria-label={`Asignar a persona ${p + 1}`}
                        >
                          {p + 1}
                        </button>
                      ))}
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="grid grid-cols-2 gap-2">
              {totalesProducto.map((t, p) => (
                <div key={p} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                  <span className="text-sm font-medium text-text">Persona {p + 1}</span>
                  <span className="num text-sm font-semibold text-text">{formatCurrency(t)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <footer className="flex justify-end gap-2 border-t border-border p-4">
        <Button variant="secondary" onClick={onCerrar}>Cerrar</Button>
        <Button onClick={onCerrar}>
          <Check size={18} /> Listo
        </Button>
      </footer>
    </Modal>
  );
}

function ModificadoresModal({
  producto,
  onCerrar,
  onAgregar,
}: {
  producto: Producto;
  onCerrar: () => void;
  onAgregar: (extraPrecio: number, nota: string) => void;
}) {
  const grupos = (producto.modificadores ?? [])
    .map((id) => gruposModificadores.find((g) => g.id === id))
    .filter((g): g is GrupoModificador => Boolean(g));

  // Selección: para grupos únicos, la primera opción por defecto; múltiples arrancan vacíos.
  const [seleccion, setSeleccion] = useState<Record<string, string[]>>(() => {
    const inicial: Record<string, string[]> = {};
    for (const g of grupos) inicial[g.id] = !g.multiple && g.requerido ? [g.opciones[0].id] : [];
    return inicial;
  });

  function toggle(grupo: GrupoModificador, opcion: OpcionModificador) {
    setSeleccion((prev) => {
      const actual = prev[grupo.id] ?? [];
      if (grupo.multiple) {
        return { ...prev, [grupo.id]: actual.includes(opcion.id) ? actual.filter((x) => x !== opcion.id) : [...actual, opcion.id] };
      }
      return { ...prev, [grupo.id]: [opcion.id] };
    });
  }

  // Todos los grupos requeridos deben tener selección.
  const completo = grupos.every((g) => !g.requerido || (seleccion[g.id]?.length ?? 0) > 0);

  const opcionesElegidas: OpcionModificador[] = grupos.flatMap((g) =>
    (seleccion[g.id] ?? []).map((oid) => g.opciones.find((o) => o.id === oid)!).filter(Boolean),
  );
  const extra = opcionesElegidas.reduce((s, o) => s + o.precio, 0);
  const nota = opcionesElegidas.map((o) => o.nombre).join(', ');
  const precioFinal = producto.precio + extra;

  return (
    <Modal onClose={onCerrar} ariaLabel={`Personalizar ${producto.nombre}`} className="w-full max-w-md">
      <header className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden>{producto.emoji}</span>
          <div>
            <h3 className="font-display text-lg font-semibold text-text">{producto.nombre}</h3>
            <p className="num text-xs text-text-muted">Base {formatCurrency(producto.precio)}</p>
          </div>
        </div>
        <button
          onClick={onCerrar}
          aria-label="Cerrar"
          className="grid h-9 w-9 place-items-center rounded-md border border-border hover:bg-surface-sunk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-500"
        >
          <X size={18} />
        </button>
      </header>

      <div className="max-h-[55vh] space-y-4 overflow-auto scroll-thin p-4">
        {grupos.map((g) => (
          <div key={g.id}>
            <div className="mb-1.5 flex items-center gap-2">
              <span className="text-sm font-semibold text-text">{g.nombre}</span>
              {g.requerido ? (
                <Badge tone="brand">Obligatorio</Badge>
              ) : (
                <span className="text-xs text-text-muted">Opcional{g.multiple ? ' · varios' : ''}</span>
              )}
            </div>
            <div className="space-y-1.5">
              {g.opciones.map((o) => {
                const activo = (seleccion[g.id] ?? []).includes(o.id);
                return (
                  <button
                    key={o.id}
                    onClick={() => toggle(g, o)}
                    className={cn(
                      'flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-500',
                      activo ? 'border-action-500 bg-action-50 text-action-700' : 'border-border bg-surface text-text hover:bg-surface-sunk',
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span className={cn(
                        'grid h-4 w-4 shrink-0 place-items-center border',
                        g.multiple ? 'rounded' : 'rounded-full',
                        activo ? 'border-action-500 bg-action-500 text-text-invert' : 'border-border',
                      )}>
                        {activo && <Check size={11} />}
                      </span>
                      {o.nombre}
                    </span>
                    {o.precio > 0 && <span className="num text-text-muted">+{formatCurrency(o.precio)}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <footer className="border-t border-border p-4">
        <Button size="lg" className="w-full" disabled={!completo} onClick={() => onAgregar(extra, nota)}>
          <Plus size={18} /> Agregar · {formatCurrency(precioFinal)}
        </Button>
      </footer>
    </Modal>
  );
}

function PromoSelectorModal({
  subtotal,
  onCerrar,
  onAplicar,
}: {
  subtotal: number;
  onCerrar: () => void;
  onAplicar: (promo: Promocion) => void;
}) {
  const activas = promocionesSeed.filter((p) => p.activa);

  return (
    <Modal onClose={onCerrar} ariaLabel="Aplicar promoción" className="w-full max-w-md">
      <header className="flex items-center justify-between border-b border-border p-4">
        <h3 className="font-display text-lg font-semibold text-text">Aplicar promoción</h3>
        <button
          onClick={onCerrar}
          aria-label="Cerrar"
          className="grid h-9 w-9 place-items-center rounded-md border border-border hover:bg-surface-sunk focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-500"
        >
          <X size={18} />
        </button>
      </header>

      <div className="max-h-[60vh] space-y-2 overflow-auto scroll-thin p-4">
        {activas.length === 0 ? (
          <div className="py-8 text-center">
            <Tag size={32} className="mx-auto text-text-muted" />
            <p className="mt-2 text-sm font-medium text-text">No hay promociones activas</p>
            <p className="text-sm text-text-muted">Actívalas en el módulo de Promociones.</p>
          </div>
        ) : (
          activas.map((p) => {
            const desc = Math.min(descuentoPromo(p, subtotal), subtotal);
            return (
              <button
                key={p.id}
                onClick={() => onAplicar(p)}
                className="flex w-full items-center gap-3 rounded-lg border border-border bg-surface p-3 text-left transition-colors hover:border-action-500 hover:bg-action-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-500"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-accent-400/25 text-accent-600">
                  <Tag size={18} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-text">{p.nombre}</div>
                  <div className="text-xs text-text-muted">{p.aplicaEn} · {p.vigencia}</div>
                </div>
                <span className="num shrink-0 text-sm font-semibold text-accent-600">−{formatCurrency(desc)}</span>
              </button>
            );
          })
        )}
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
