import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  LayoutGrid,
  ReceiptText,
  CreditCard,
  Percent,
  Tag,
  Calculator,
  StickyNote,
  Trash2,
  X,
  ChefHat,
  Utensils,
  Store,
  ShoppingBag,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useConfirm } from '@/components/ui/ConfirmDialog';
import { StepBtn, CatChip } from './components/PosControls';
import { NotaLineaModal } from './components/NotaLineaModal';
import { CalculadoraVueltoModal } from './components/CalculadoraVueltoModal';
import { CobroModal } from './components/CobroModal';
import { DescuentoModal } from './components/DescuentoModal';
import { DividirCuentaModal } from './components/DividirCuentaModal';
import { ModificadoresModal } from './components/ModificadoresModal';
import { PromoSelectorModal } from './components/PromoSelectorModal';
import { usePosTicket } from './hooks/usePosTicket';
import { formatCurrency } from '@/lib/format';
import { iconoCategoria } from '@/lib/iconosCategoria';
import { useToast } from '@/lib/toast';
import { useOperacion, type TipoVenta } from '@/lib/operacion';
import { type Producto, type Promocion } from '@/mock/data';


const tipoVentaInfo: Record<TipoVenta, { label: string; icon: LucideIcon }> = {
  mesa: { label: 'Mesa', icon: Utensils },
  mostrador: { label: 'Mostrador', icon: Store },
  llevar: { label: 'Para llevar', icon: ShoppingBag },
};

export function PosPage() {
  const [params, setParams] = useSearchParams();
  const { mesas, cuentas, productos, categorias, enviarComanda, cobrar, pedirCuenta } = useOperacion();

  const mesaId = params.get('mesa') ?? undefined;
  const mesa = mesaId ? mesas.find((m) => m.id === mesaId) : undefined;
  const tipoVenta: TipoVenta = mesaId ? 'mesa' : params.get('tipo') === 'llevar' ? 'llevar' : 'mostrador';

  const {
    lineas,
    descuento,
    setDescuento,
    promo,
    setPromo,
    agregarLinea,
    cambiarCantidad,
    cambiarNota,
    limpiarTicket,
    precioLinea,
    subtotal,
    promoDesc,
    total,
    totalItems,
    lineasParaStore,
  } = usePosTicket();

  const [catActiva, setCatActiva] = useState<string>('all');
  const [busqueda, setBusqueda] = useState('');
  const [cobroAbierto, setCobroAbierto] = useState(false);
  const [descuentoAbierto, setDescuentoAbierto] = useState(false);
  const [promoAbierta, setPromoAbierta] = useState(false);
  const [dividirAbierto, setDividirAbierto] = useState(false);
  const [calcAbierta, setCalcAbierta] = useState(false);
  // uid de la línea cuya nota se está editando.
  const [notaUid, setNotaUid] = useState<string | null>(null);
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
            <CatChip label="Todos" icon={LayoutGrid} active={catActiva === 'all'} onClick={() => setCatActiva('all')} />
            {categorias.map((c) => (
              <CatChip
                key={c.id}
                label={c.nombre}
                icon={iconoCategoria(c.id)}
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
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCalcAbierta(true)}
              aria-label="Calculadora de vuelto"
              title="Calculadora de vuelto"
              className="grid h-9 w-9 place-items-center rounded-md border border-border text-text-muted hover:bg-surface-sunk hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-500"
            >
              <Calculator size={18} />
            </button>
            <Badge tone="action">{totalItems} art.</Badge>
          </div>
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
                    <button
                      onClick={() => setNotaUid(l.uid)}
                      className="mt-0.5 inline-flex max-w-full items-center gap-1 rounded text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action-500"
                    >
                      <StickyNote size={12} className="shrink-0 text-text-muted" />
                      {l.nota ? (
                        <span className="truncate italic text-accent-600">{l.nota}</span>
                      ) : (
                        <span className="text-text-muted hover:text-text">Agregar nota</span>
                      )}
                    </button>
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

      {calcAbierta && (
        <CalculadoraVueltoModal totalInicial={total} onCerrar={() => setCalcAbierta(false)} />
      )}

      {notaUid && (
        <NotaLineaModal
          nombre={lineas.find((l) => l.uid === notaUid)?.producto.nombre ?? ''}
          notaActual={lineas.find((l) => l.uid === notaUid)?.nota ?? ''}
          onGuardar={(nota) => { cambiarNota(notaUid, nota); setNotaUid(null); }}
          onCerrar={() => setNotaUid(null)}
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

