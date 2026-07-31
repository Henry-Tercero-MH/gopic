import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getProveedores,
  crearProveedor,
  editarProveedor,
  eliminarProveedor,
  type ProveedorInput,
} from './api';

/** Proveedores de la sucursal. */
export function useProveedores() {
  return useQuery({ queryKey: ['proveedores'], queryFn: getProveedores });
}

/** Mutaciones de proveedores; invalidan la lista al terminar. */
export function useProveedorMutations() {
  const qc = useQueryClient();
  const invalidar = () => qc.invalidateQueries({ queryKey: ['proveedores'] });
  return {
    crear: useMutation({ mutationFn: (data: ProveedorInput) => crearProveedor(data), onSuccess: invalidar }),
    editar: useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<ProveedorInput> }) => editarProveedor(id, data),
      onSuccess: invalidar,
    }),
    eliminar: useMutation({ mutationFn: (id: string) => eliminarProveedor(id), onSuccess: invalidar }),
  };
}
