import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getPromociones,
  crearPromocion,
  editarPromocion,
  eliminarPromocion,
  type PromocionInput,
} from './api';

/** Promociones de la sucursal. */
export function usePromociones() {
  return useQuery({ queryKey: ['promociones'], queryFn: getPromociones });
}

/** Mutaciones de promociones; invalidan la lista al terminar. */
export function usePromocionMutations() {
  const qc = useQueryClient();
  const invalidar = () => qc.invalidateQueries({ queryKey: ['promociones'] });
  return {
    crear: useMutation({ mutationFn: (data: PromocionInput) => crearPromocion(data), onSuccess: invalidar }),
    editar: useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<PromocionInput> }) => editarPromocion(id, data),
      onSuccess: invalidar,
    }),
    eliminar: useMutation({ mutationFn: (id: string) => eliminarPromocion(id), onSuccess: invalidar }),
  };
}
