import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getInsumos,
  getKardex,
  reprocesar,
  crearInsumo,
  editarInsumo,
  eliminarInsumo,
  type InsumoInput,
} from './api';

/** Catálogo de insumos con existencia real. Se refresca cada 15s. */
export function useInsumos() {
  return useQuery({ queryKey: ['insumos'], queryFn: getInsumos, refetchInterval: 15_000 });
}

/** Kardex (movimientos) del insumo seleccionado. */
export function useKardex(insumoId: string | null) {
  return useQuery({
    queryKey: ['kardex', insumoId],
    queryFn: () => getKardex(insumoId!),
    enabled: !!insumoId,
  });
}

/** Reproceso: convierte un insumo en su derivado; invalida insumos y kardex. */
export function useReproceso() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: reprocesar,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['insumos'] });
      qc.invalidateQueries({ queryKey: ['kardex'] });
    },
  });
}

/** Mutaciones de insumos (datos maestros + existencia); invalidan insumos y kardex. */
export function useInsumoMutations() {
  const qc = useQueryClient();
  const invalidar = () => {
    qc.invalidateQueries({ queryKey: ['insumos'] });
    qc.invalidateQueries({ queryKey: ['kardex'] });
  };
  return {
    crear: useMutation({ mutationFn: (data: InsumoInput) => crearInsumo(data), onSuccess: invalidar }),
    editar: useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<InsumoInput> }) => editarInsumo(id, data),
      onSuccess: invalidar,
    }),
    eliminar: useMutation({ mutationFn: (id: string) => eliminarInsumo(id), onSuccess: invalidar }),
  };
}
