import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getRecetas, guardarReceta, eliminarReceta, type RecetaInput } from './api';

/** Recetas de la sucursal con costeo derivado del inventario. */
export function useRecetas() {
  return useQuery({ queryKey: ['recetas'], queryFn: getRecetas });
}

/** Mutaciones de recetas; invalidan la lista al terminar. */
export function useRecetaMutations() {
  const qc = useQueryClient();
  const invalidar = () => qc.invalidateQueries({ queryKey: ['recetas'] });
  return {
    guardar: useMutation({ mutationFn: (data: RecetaInput) => guardarReceta(data), onSuccess: invalidar }),
    eliminar: useMutation({ mutationFn: (id: string) => eliminarReceta(id), onSuccess: invalidar }),
  };
}
