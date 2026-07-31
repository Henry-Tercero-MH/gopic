import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMesas, crearMesa, editarMesa, eliminarMesa, type MesaInput } from './api';

/** Lista de mesas (con zona y estado). */
export function useMesas() {
  return useQuery({ queryKey: ['mesas'], queryFn: getMesas });
}

/** Mutaciones de mesas; invalidan la lista al terminar. */
export function useMesaMutations() {
  const qc = useQueryClient();
  const invalidar = () => qc.invalidateQueries({ queryKey: ['mesas'] });
  return {
    crear: useMutation({ mutationFn: (data: MesaInput) => crearMesa(data), onSuccess: invalidar }),
    editar: useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<MesaInput> }) => editarMesa(id, data),
      onSuccess: invalidar,
    }),
    eliminar: useMutation({ mutationFn: (id: string) => eliminarMesa(id), onSuccess: invalidar }),
  };
}
