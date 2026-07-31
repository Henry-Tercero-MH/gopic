import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getRecompensasAdmin,
  crearRecompensa,
  editarRecompensa,
  eliminarRecompensa,
  getConfigLealtad,
  editarConfigLealtad,
  type RecompensaInput,
} from './api';

/** Todas las recompensas de la sucursal (gestión, incluye inactivas). */
export function useRecompensasAdmin() {
  return useQuery({ queryKey: ['recompensas-admin'], queryFn: getRecompensasAdmin });
}

/** Mutaciones de recompensas; invalidan gestión y la lista de canje. */
export function useRecompensaMutations() {
  const qc = useQueryClient();
  const invalidar = () => {
    qc.invalidateQueries({ queryKey: ['recompensas-admin'] });
    qc.invalidateQueries({ queryKey: ['recompensas'] });
  };
  return {
    crear: useMutation({ mutationFn: (data: RecompensaInput) => crearRecompensa(data), onSuccess: invalidar }),
    editar: useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<RecompensaInput> }) => editarRecompensa(id, data),
      onSuccess: invalidar,
    }),
    eliminar: useMutation({ mutationFn: (id: string) => eliminarRecompensa(id), onSuccess: invalidar }),
  };
}

/** Tasa de acumulación de puntos (quetzales por punto). */
export function useConfigLealtad() {
  return useQuery({ queryKey: ['config-lealtad'], queryFn: getConfigLealtad });
}

/** Guarda la tasa de acumulación. */
export function useConfigLealtadMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (quetzalesPorPunto: number) => editarConfigLealtad(quetzalesPorPunto),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['config-lealtad'] }),
  });
}
