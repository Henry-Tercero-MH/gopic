import { useState } from 'react';
import { Banknote, CreditCard, CheckCircle2, X } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { formatCurrency } from '@/lib/format';
import { type MetodoPago } from '@/lib/operacion';
import { MetodoBtn } from './PosControls';
import { DENOMINACIONES } from '../constantes';

export interface Venta {
  folio: string;
  metodo: MetodoPago;
  total: number;
  recibido: number;
  cambio: number;
}

export function CobroModal({
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
