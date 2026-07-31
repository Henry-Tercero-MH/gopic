import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getEmpleados,
  crearEmpleado,
  editarEmpleado,
  eliminarEmpleado,
  marcarEntradaEmpleado,
  marcarSalidaEmpleado,
  type EmpleadoInput,
} from './api';

/** Personal de la sucursal con su marcaje de hoy. */
export function useEmpleados() {
  return useQuery({ queryKey: ['empleados'], queryFn: getEmpleados });
}

/** Mutaciones de personal y marcaje; invalidan la lista al terminar. */
export function useEmpleadoMutations() {
  const qc = useQueryClient();
  const invalidar = () => qc.invalidateQueries({ queryKey: ['empleados'] });
  return {
    crear: useMutation({ mutationFn: (data: EmpleadoInput) => crearEmpleado(data), onSuccess: invalidar }),
    editar: useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<EmpleadoInput> }) => editarEmpleado(id, data),
      onSuccess: invalidar,
    }),
    eliminar: useMutation({ mutationFn: (id: string) => eliminarEmpleado(id), onSuccess: invalidar }),
    entrada: useMutation({ mutationFn: (id: string) => marcarEntradaEmpleado(id), onSuccess: invalidar }),
    salida: useMutation({ mutationFn: (id: string) => marcarSalidaEmpleado(id), onSuccess: invalidar }),
  };
}
