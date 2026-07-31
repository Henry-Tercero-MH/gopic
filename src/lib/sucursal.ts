import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getSucursal, editarSucursal, type SucursalInput } from './api';

/** Datos del negocio (sucursal del usuario). */
export function useSucursal() {
  return useQuery({ queryKey: ['sucursal'], queryFn: getSucursal });
}

/** Guarda los datos del negocio; invalida la sucursal al terminar. */
export function useSucursalMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SucursalInput) => editarSucursal(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sucursal'] }),
  });
}
