import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getComandas,
  getHistorialComandas,
  avanzarComanda,
  crearComanda,
  getCuentaMesa,
  pedirCuentaMesa,
  type EstadoComandaApi,
} from './api';

/** Comandas activas del KDS. Se refresca cada 5s para el tablero en vivo. */
export function useComandas() {
  return useQuery({ queryKey: ['comandas'], queryFn: getComandas, refetchInterval: 5_000 });
}

/** Historial de comandas entregadas (bajo demanda). */
export function useHistorialComandas(activo: boolean) {
  return useQuery({ queryKey: ['comandas-historial'], queryFn: getHistorialComandas, enabled: activo });
}

/** Avanza/entrega una comanda; invalida el tablero al terminar. */
export function useAvanzarComanda() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: EstadoComandaApi }) => avanzarComanda(id, estado),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comandas'] }),
  });
}

/** Cuenta abierta de una mesa (ítems acumulados enviados a cocina). */
export function useCuentaMesa(mesaId: string | undefined) {
  return useQuery({
    queryKey: ['cuenta-mesa', mesaId],
    queryFn: () => getCuentaMesa(mesaId!),
    enabled: !!mesaId,
  });
}

/** Enviar a cocina (crea/acumula la comanda) + pedir la cuenta de una mesa. */
export function useMesaServicio() {
  const qc = useQueryClient();
  const refrescar = (mesaId?: string) => {
    qc.invalidateQueries({ queryKey: ['comandas'] });
    qc.invalidateQueries({ queryKey: ['mesas'] });
    if (mesaId) qc.invalidateQueries({ queryKey: ['cuenta-mesa', mesaId] });
  };
  return {
    enviar: useMutation({
      mutationFn: (payload: Parameters<typeof crearComanda>[0]) => crearComanda(payload),
      onSuccess: (_data, vars) => refrescar(vars.mesaId),
    }),
    pedirCuenta: useMutation({
      mutationFn: ({ cuentaId }: { cuentaId: string; mesaId: string }) => pedirCuentaMesa(cuentaId),
      onSuccess: (_data, vars) => refrescar(vars.mesaId),
    }),
  };
}
