import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getClientes,
  getRecompensas,
  getMovimientosLealtad,
  crearCliente,
  editarCliente,
  eliminarCliente,
  type ClienteInput,
} from './api';

/** Lista de clientes (con puntos/visitas). */
export function useClientes() {
  return useQuery({ queryKey: ['clientes'], queryFn: getClientes });
}

/** Recompensas activas (para canjear puntos). */
export function useRecompensas() {
  return useQuery({ queryKey: ['recompensas'], queryFn: getRecompensas, staleTime: 5 * 60 * 1000 });
}

/** Historial de puntos de un cliente. */
export function useMovimientosLealtad(clienteId: string | null) {
  return useQuery({
    queryKey: ['movimientos-lealtad', clienteId],
    queryFn: () => getMovimientosLealtad(clienteId!),
    enabled: !!clienteId,
  });
}

/** Mutaciones de clientes; invalidan la lista al terminar. */
export function useClienteMutations() {
  const qc = useQueryClient();
  const invalidar = () => qc.invalidateQueries({ queryKey: ['clientes'] });

  return {
    crear: useMutation({ mutationFn: (data: ClienteInput) => crearCliente(data), onSuccess: invalidar }),
    editar: useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<ClienteInput> }) => editarCliente(id, data),
      onSuccess: invalidar,
    }),
    eliminar: useMutation({ mutationFn: (id: string) => eliminarCliente(id), onSuccess: invalidar }),
  };
}
