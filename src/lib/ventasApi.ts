import {
  getFormasPago,
  getCajaActual,
  abrirCaja,
  registrarVenta,
  type ItemVentaApi,
  type VentaResultado,
} from './api';

/** Cache simple de formas de pago (cambian casi nunca). */
let formasCache: { id: string; nombre: string }[] | null = null;

async function formaPagoId(metodo: 'efectivo' | 'tarjeta'): Promise<string> {
  if (!formasCache) formasCache = await getFormasPago();
  const nombre = metodo === 'efectivo' ? 'Efectivo' : 'Tarjeta';
  const forma = formasCache.find((f) => f.nombre === nombre);
  if (!forma) throw new Error(`Falta configurar la forma de pago "${nombre}" en el backend.`);
  return forma.id;
}

/** Garantiza una caja abierta (si no hay, la abre con fondo 0). */
async function asegurarCaja(): Promise<void> {
  const caja = await getCajaActual();
  if (!caja.abierta) await abrirCaja(0);
}

/**
 * Cobra una venta contra el backend: asegura caja, resuelve la forma de pago,
 * arma el ticket y llama a registrar_venta. Devuelve el folio real y el total.
 */
export async function cobrarVenta(args: {
  tipoVenta: 'mesa' | 'mostrador' | 'llevar';
  items: ItemVentaApi[];
  metodo: 'efectivo' | 'tarjeta';
  recibido: number;
  /** Descuento total en Q (manual + promo + recompensa), ya calculado en la UI. */
  descuento: number;
  clienteId?: string;
  recompensaId?: string;
  /** Cuenta a cobrar (servicio en mesa): al pagar se cierra y libera la mesa. */
  cuentaId?: string;
}): Promise<VentaResultado> {
  await asegurarCaja();
  const forma = await formaPagoId(args.metodo);

  const totalItems = args.items.reduce((s, i) => s + i.precio_unitario * i.cantidad, 0);
  const totalFinal = Math.max(0, totalItems - args.descuento);

  return registrarVenta({
    tipoVenta: args.tipoVenta,
    items: args.items.map((i) => ({ ...i, es_cortesia: false })),
    pagos: [{ forma_pago_id: forma, monto: totalFinal, recibido: args.recibido }],
    descuento: args.descuento,
    clienteId: args.clienteId,
    recompensaId: args.recompensaId,
    cuentaId: args.cuentaId,
  });
}
