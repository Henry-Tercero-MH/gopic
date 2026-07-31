import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getGastos, crearGasto, editarGasto, eliminarGasto, type GastoInput } from './api';

/** Lista de gastos de la sucursal. */
export function useGastos() {
  return useQuery({ queryKey: ['gastos'], queryFn: getGastos });
}

/** Mutaciones de gastos; invalidan la lista al terminar. */
export function useGastoMutations() {
  const qc = useQueryClient();
  const invalidar = () => qc.invalidateQueries({ queryKey: ['gastos'] });
  return {
    crear: useMutation({ mutationFn: (data: GastoInput) => crearGasto(data), onSuccess: invalidar }),
    editar: useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<GastoInput> }) => editarGasto(id, data),
      onSuccess: invalidar,
    }),
    eliminar: useMutation({ mutationFn: (id: string) => eliminarGasto(id), onSuccess: invalidar }),
  };
}
