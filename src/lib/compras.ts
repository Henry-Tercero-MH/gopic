import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getOrdenesCompra,
  crearOrdenCompra,
  recibirOrdenCompra,
  eliminarOrdenCompra,
  type OrdenCompraInput,
} from './api';

/** Órdenes de compra de la sucursal. */
export function useOrdenesCompra() {
  return useQuery({ queryKey: ['ordenes-compra'], queryFn: getOrdenesCompra });
}

/** Mutaciones de compras; recibir además refresca inventario. */
export function useCompraMutations() {
  const qc = useQueryClient();
  const invalidar = () => qc.invalidateQueries({ queryKey: ['ordenes-compra'] });
  return {
    crear: useMutation({ mutationFn: (data: OrdenCompraInput) => crearOrdenCompra(data), onSuccess: invalidar }),
    recibir: useMutation({
      mutationFn: (id: string) => recibirOrdenCompra(id),
      onSuccess: () => {
        invalidar();
        qc.invalidateQueries({ queryKey: ['insumos'] });
        qc.invalidateQueries({ queryKey: ['kardex'] });
      },
    }),
    eliminar: useMutation({ mutationFn: (id: string) => eliminarOrdenCompra(id), onSuccess: invalidar }),
  };
}
