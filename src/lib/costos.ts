import { useCallback, useState } from 'react';

/**
 * Parámetros de costo del negocio para calcular la utilidad neta del día.
 * Prototipo: se editan desde el Dashboard y se guardan en localStorage.
 * Cuando haya backend, esto vendrá de la configuración del negocio.
 */
export interface CostosOperativos {
  /** Renta mensual del local (Q). */
  rentaMensual: number;
  /** Energía eléctrica mensual (Q). */
  energiaMensual: number;
  /** Planilla / sueldos mensuales del personal (Q). */
  personalMensual: number;
  /** Gasto de producción como % de la venta (food cost). */
  costoProduccionPct: number;
  /** Reserva para mantenimiento / reparación / reemplazo de máquinas, como % de la venta. */
  mantenimientoPct: number;
}

const DEFAULTS: CostosOperativos = {
  rentaMensual: 8000,
  energiaMensual: 2500,
  personalMensual: 18000,
  costoProduccionPct: 35,
  mantenimientoPct: 10,
};

const KEY = 'gopic:costos-operativos';
/** Base de días para prorratear los gastos mensuales a un día. */
const DIAS_MES = 30;

function leer(): CostosOperativos {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) ?? '{}') };
  } catch {
    return DEFAULTS;
  }
}

/** Hook con los costos actuales y una función para guardarlos (persiste en localStorage). */
export function useCostosOperativos() {
  const [costos, setCostos] = useState<CostosOperativos>(leer);
  const guardar = useCallback((c: CostosOperativos) => {
    setCostos(c);
    try {
      localStorage.setItem(KEY, JSON.stringify(c));
    } catch {
      /* almacenamiento no disponible: se mantiene solo en memoria */
    }
  }, []);
  return { costos, guardar };
}

export interface DesgloseUtilidad {
  produccion: number;
  operativosDia: number;
  mantenimiento: number;
  utilidad: number;
  /** Margen neto como % de la venta. */
  margen: number;
}

/**
 * Utilidad neta del día = venta − producción − gastos operativos del día − reserva de mantenimiento.
 * Los gastos operativos mensuales (renta + energía + personal) se prorratean a un día.
 */
export function calcularUtilidad(ventas: number, c: CostosOperativos): DesgloseUtilidad {
  const produccion = ventas * (c.costoProduccionPct / 100);
  const operativosDia = (c.rentaMensual + c.energiaMensual + c.personalMensual) / DIAS_MES;
  const mantenimiento = ventas * (c.mantenimientoPct / 100);
  const utilidad = ventas - produccion - operativosDia - mantenimiento;
  const margen = ventas > 0 ? (utilidad / ventas) * 100 : 0;
  return { produccion, operativosDia, mantenimiento, utilidad, margen };
}
