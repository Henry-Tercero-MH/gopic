import { useState } from 'react';
import { estacionDe, type LineaTicket } from '@/lib/operacion';
import { type Producto } from '@/lib/tipos';
import { type PromocionApi as Promocion } from '@/lib/api';

export interface Linea {
  /** Id único de línea: dos veces el mismo producto con distintos modificadores son líneas distintas. */
  uid: string;
  producto: Producto;
  cantidad: number;
  /** Ajuste de precio unitario por los modificadores elegidos. */
  extraPrecio: number;
  /** Texto legible de los modificadores, para el ticket y la comanda. */
  nota?: string;
}

/** Calcula el descuento en Q que una promoción aplica sobre un subtotal. */
export function descuentoPromo(promo: Promocion, subtotal: number): number {
  switch (promo.tipo) {
    case 'porcentaje': return (subtotal * promo.valor) / 100;
    case 'monto': return promo.valor;
    case 'combo': return Math.max(0, subtotal - promo.valor);
    case '2x1': return subtotal / 2; // aproximación para la demo: mitad del ticket
  }
}

/**
 * Estado y lógica de negocio del ticket del POS: líneas, descuento y promoción,
 * con las operaciones y los totales derivados. Sin dependencias de UI (modales,
 * toasts): eso vive en la vista.
 */
export function usePosTicket() {
  const [lineas, setLineas] = useState<Linea[]>([]);
  const [descuento, setDescuento] = useState(0);
  const [promo, setPromo] = useState<Promocion | null>(null);

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

  /** Fija (o limpia) la nota de una línea del ticket. */
  function cambiarNota(uid: string, nota: string) {
    const limpia = nota.trim();
    setLineas((prev) => prev.map((l) => (l.uid === uid ? { ...l, nota: limpia || undefined } : l)));
  }

  function limpiarTicket() {
    setLineas([]);
    setDescuento(0);
    setPromo(null);
  }

  // Precio unitario de una línea = precio base + ajuste de modificadores.
  const precioLinea = (l: Linea) => l.producto.precio + l.extraPrecio;
  const subtotal = lineas.reduce((s, l) => s + precioLinea(l) * l.cantidad, 0);
  const promoDesc = promo ? descuentoPromo(promo, subtotal) : 0;
  // El total nunca baja de 0; el descuento manual y la promo se suman.
  const descuentoAplicado = Math.min(descuento + promoDesc, subtotal);
  const total = subtotal - descuentoAplicado;
  const totalItems = lineas.reduce((s, l) => s + l.cantidad, 0);

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

  return {
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
    descuentoAplicado,
    total,
    totalItems,
    lineasParaStore,
  };
}
