import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCajaActual, abrirCaja, registrarMovimientoCaja, cerrarCaja } from './api';

/** Estado de la caja del turno (sesión, resumen y movimientos). */
export function useCaja() {
  return useQuery({ queryKey: ['caja'], queryFn: getCajaActual, refetchInterval: 20_000 });
}

/** Mutaciones de caja; refrescan el estado del turno. */
export function useCajaMutations() {
  const qc = useQueryClient();
  const invalidar = () => qc.invalidateQueries({ queryKey: ['caja'] });
  return {
    abrir: useMutation({ mutationFn: (fondo: number) => abrirCaja(fondo), onSuccess: invalidar }),
    movimiento: useMutation({
      mutationFn: ({ tipo, concepto, monto }: { tipo: 'Ingreso' | 'Retiro'; concepto: string; monto: number }) =>
        registrarMovimientoCaja(tipo, concepto, monto),
      onSuccess: invalidar,
    }),
    cerrar: useMutation({ mutationFn: (efectivoContado: number) => cerrarCaja(efectivoContado), onSuccess: invalidar }),
  };
}
