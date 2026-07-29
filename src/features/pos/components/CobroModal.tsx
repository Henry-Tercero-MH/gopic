import { useMemo, useState } from 'react';
import { Banknote, CreditCard, CheckCircle2, X, Star, Gift, UserRound } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';
import { formatCurrency } from '@/lib/format';
import { useOperacion, type MetodoPago, type Recompensa } from '@/lib/operacion';
import { MetodoBtn } from './PosControls';
import { DENOMINACIONES } from '../constantes';

export interface Venta {
  folio: string;
  metodo: MetodoPago;
  total: number;
  recibido: number;
  cambio: number;
  puntosGanados: number;
}

export interface DatosCobro {
  metodo: MetodoPago;
  clienteId?: string;
  recompensaId?: string;
}

/** Descuento en Q que aplica una recompensa de descuento sobre un total. */
function descuentoDeRecompensa(r: Recompensa, base: number): number {
  if (r.tipo === 'descuento_monto') return Math.min(r.valor ?? 0, base);
  if (r.tipo === 'descuento_pct') return (base * (r.valor ?? 0)) / 100;
  return 0; // producto gratis no descuenta del total (se regala aparte)
}

export function CobroModal({
  total,
  registrarCobro,
  onCerrar,
  onCompletar,
  onVentaCobrada,
}: {
  total: number;
  /** Cobra la venta (backend) y devuelve el folio real. */
  registrarCobro: (datos: DatosCobro & { totalFinal: number; recibido: number }) => Promise<string>;
  onCerrar: () => void;
  onCompletar: () => void;
  onVentaCobrada: (venta: Venta) => void;
}) {
  const { clientes, recompensas, configLealtad } = useOperacion();

  const [metodo, setMetodo] = useState<MetodoPago>('efectivo');
  const [recibido, setRecibido] = useState('');
  const [clienteId, setClienteId] = useState('');
  const [recompensaId, setRecompensaId] = useState('');
  const [venta, setVenta] = useState<Venta | null>(null);
  const [cobrando, setCobrando] = useState(false);
  const [errorCobro, setErrorCobro] = useState('');

  const cliente = clientes.find((c) => c.id === clienteId);
  const recompensasCanjeables = useMemo(
    () => (cliente ? recompensas.filter((r) => r.activa && cliente.puntos >= r.costoPuntos) : []),
    [cliente, recompensas],
  );
  const recompensa = recompensaId ? recompensas.find((r) => r.id === recompensaId) : undefined;

  const descuento = recompensa ? descuentoDeRecompensa(recompensa, total) : 0;
  const totalFinal = Math.max(0, total - descuento);
  const puntosGanados = cliente ? Math.floor(totalFinal / configLealtad.quetzalesPorPunto) : 0;

  const recibidoNum = parseFloat(recibido) || 0;
  const cambio = recibidoNum - totalFinal;
  const puedeConfirmar = metodo === 'tarjeta' || recibidoNum >= totalFinal;

  function elegirCliente(id: string) {
    setClienteId(id);
    setRecompensaId(''); // al cambiar de cliente se limpia la recompensa
  }

  async function confirmar() {
    setErrorCobro('');
    setCobrando(true);
    try {
      const recibidoFinal = metodo === 'efectivo' ? recibidoNum : totalFinal;
      const folio = await registrarCobro({
        metodo,
        clienteId: clienteId || undefined,
        recompensaId: recompensaId || undefined,
        totalFinal,
        recibido: recibidoFinal,
      });
      const nueva: Venta = {
        folio,
        metodo,
        total: totalFinal,
        recibido: recibidoFinal,
        cambio: metodo === 'efectivo' ? cambio : 0,
        puntosGanados,
      };
      setVenta(nueva);
      onVentaCobrada(nueva);
    } catch (e) {
      setErrorCobro(e instanceof Error ? e.message : 'No se pudo cobrar la venta.');
    } finally {
      setCobrando(false);
    }
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

          {venta.puntosGanados > 0 && (
            <p className="num mt-3 inline-flex items-center gap-1 rounded-full bg-accent-400/20 px-3 py-1 text-sm font-semibold text-accent-600">
              <Star size={14} /> +{venta.puntosGanados} puntos acumulados
            </p>
          )}

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
              <p className="num text-sm text-text-muted">Total a pagar: {formatCurrency(totalFinal)}</p>
            </div>
            <button
              onClick={onCerrar}
              aria-label="Cerrar"
              className="grid h-9 w-9 place-items-center rounded-md border border-border hover:bg-surface-sunk"
            >
              <X size={18} />
            </button>
          </header>

          <div className="max-h-[70vh] space-y-4 overflow-auto scroll-thin p-4">
            {/* Cliente (fidelización) */}
            <div>
              <label htmlFor="cliente" className="mb-1 flex items-center gap-1.5 text-sm font-medium text-text">
                <UserRound size={15} /> Cliente
              </label>
              <select
                id="cliente"
                value={clienteId}
                onChange={(e) => elegirCliente(e.target.value)}
                className="h-10 w-full rounded-md border border-border bg-surface-alt px-3 text-sm text-text focus:border-action-500 focus:outline-none"
              >
                <option value="">Sin cliente (Consumidor Final)</option>
                {clientes
                  .filter((c) => c.nit !== 'CF')
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} · {c.puntos} pts
                    </option>
                  ))}
              </select>
            </div>

            {/* Recompensa canjeable */}
            {cliente && (
              <div>
                <span className="mb-1 flex items-center gap-1.5 text-sm font-medium text-text">
                  <Gift size={15} /> Canjear recompensa
                </span>
                {recompensasCanjeables.length === 0 ? (
                  <p className="rounded-md bg-surface-alt px-3 py-2 text-xs text-text-muted">
                    {cliente.nombre} tiene {cliente.puntos} pts. Aún no alcanza para ninguna recompensa activa.
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    <button
                      onClick={() => setRecompensaId('')}
                      className={cn(
                        'flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition-colors',
                        recompensaId === '' ? 'border-action-500 bg-action-50 text-action-700' : 'border-border hover:bg-surface-sunk',
                      )}
                    >
                      No canjear puntos
                    </button>
                    {recompensasCanjeables.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => setRecompensaId(r.id)}
                        className={cn(
                          'flex w-full items-center justify-between gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors',
                          recompensaId === r.id ? 'border-action-500 bg-action-50 text-action-700' : 'border-border hover:bg-surface-sunk',
                        )}
                      >
                        <span className="min-w-0 flex-1 truncate font-medium text-text">{r.nombre}</span>
                        <Badge tone="accent"><Star size={11} className="mr-0.5" /> {r.costoPuntos}</Badge>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Desglose si hay descuento por recompensa */}
            {recompensa && (
              <dl className="space-y-1 rounded-lg bg-surface-alt p-3 text-sm">
                <div className="flex justify-between text-text-muted">
                  <dt>Subtotal</dt>
                  <dd className="num">{formatCurrency(total)}</dd>
                </div>
                {descuento > 0 && (
                  <div className="flex justify-between text-accent-600">
                    <dt>{recompensa.nombre}</dt>
                    <dd className="num">−{formatCurrency(descuento)}</dd>
                  </div>
                )}
                {recompensa.tipo === 'producto' && (
                  <div className="flex justify-between text-accent-600">
                    <dt>Producto de regalo</dt>
                    <dd className="text-xs">se rebaja del inventario</dd>
                  </div>
                )}
                <div className="flex justify-between border-t border-border pt-1 font-semibold text-text">
                  <dt>Total</dt>
                  <dd className="num">{formatCurrency(totalFinal)}</dd>
                </div>
              </dl>
            )}

            {/* Método de pago */}
            <div className="grid grid-cols-2 gap-2">
              <MetodoBtn activo={metodo === 'efectivo'} icon={Banknote} label="Efectivo" onClick={() => setMetodo('efectivo')} />
              <MetodoBtn activo={metodo === 'tarjeta'} icon={CreditCard} label="Tarjeta" onClick={() => setMetodo('tarjeta')} />
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

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setRecibido(String(totalFinal))}
                    className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-text hover:bg-surface-sunk"
                  >
                    Exacto
                  </button>
                  {DENOMINACIONES.filter((d) => d >= totalFinal).map((d) => (
                    <button
                      key={d}
                      onClick={() => setRecibido(String(d))}
                      className="num rounded-md border border-border px-3 py-1.5 text-sm font-medium text-text hover:bg-surface-sunk"
                    >
                      {formatCurrency(d)}
                    </button>
                  ))}
                </div>

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
                <p className="mt-2 text-sm text-text-muted">Pasa o inserta la tarjeta en la terminal y aprueba el pago.</p>
              </div>
            )}

            {cliente && puntosGanados > 0 && (
              <p className="num text-center text-xs text-text-muted">
                {cliente.nombre} ganará <span className="font-semibold text-accent-600">+{puntosGanados} puntos</span> con esta compra.
              </p>
            )}

            {errorCobro && (
              <p className="rounded-md bg-danger/10 px-3 py-2 text-sm font-medium text-danger">{errorCobro}</p>
            )}

            <Button size="lg" className="w-full" disabled={!puedeConfirmar || cobrando} loading={cobrando} onClick={confirmar}>
              <CheckCircle2 size={20} /> Confirmar pago · {formatCurrency(totalFinal)}
            </Button>
          </div>
        </>
      )}
    </Modal>
  );
}
