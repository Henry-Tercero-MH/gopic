import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getComandas, avanzarComanda, type EstadoComandaApi } from './api';

/** Comandas activas del KDS. Se refresca cada 5s para el tablero en vivo. */
export function useComandas() {
  return useQuery({ queryKey: ['comandas'], queryFn: getComandas, refetchInterval: 5_000 });
}

/** Avanza/entrega una comanda; invalida el tablero al terminar. */
export function useAvanzarComanda() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: EstadoComandaApi }) => avanzarComanda(id, estado),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['comandas'] }),
  });
}
