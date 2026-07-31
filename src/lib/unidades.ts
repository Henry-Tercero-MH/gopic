import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getUnidades, crearUnidad, editarUnidad, eliminarUnidad, type UnidadInput } from './api';

/** Catálogo global de unidades de medida. */
export function useUnidades() {
  return useQuery({ queryKey: ['unidades'], queryFn: getUnidades, staleTime: 5 * 60 * 1000 });
}

/** Mutaciones de unidades; invalidan la lista (e insumos, que las referencian). */
export function useUnidadMutations() {
  const qc = useQueryClient();
  const invalidar = () => {
    qc.invalidateQueries({ queryKey: ['unidades'] });
    qc.invalidateQueries({ queryKey: ['insumos'] });
  };
  return {
    crear: useMutation({ mutationFn: (data: UnidadInput) => crearUnidad(data), onSuccess: invalidar }),
    editar: useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<UnidadInput> }) => editarUnidad(id, data),
      onSuccess: invalidar,
    }),
    eliminar: useMutation({ mutationFn: (id: string) => eliminarUnidad(id), onSuccess: invalidar }),
  };
}
