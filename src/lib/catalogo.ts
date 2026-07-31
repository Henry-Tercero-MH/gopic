import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getProductos,
  getCategorias,
  getModificadores,
  crearProducto,
  editarProducto,
  eliminarProducto,
  crearCategoria,
  editarCategoria,
  eliminarCategoria,
  type ProductoInput,
  type CategoriaInput,
} from './api';
import { registrarIconosCategoria } from './iconosCategoria';
import type { Producto, Categoria } from '@/lib/tipos';

/**
 * Trae productos y categorías del backend, los mapea a los tipos que usa la UI
 * y registra los iconos de categoría. React Query gestiona carga/error/caché.
 */
async function cargarCatalogo(): Promise<{ productos: Producto[]; categorias: Categoria[] }> {
  const [prods, cats] = await Promise.all([getProductos(), getCategorias()]);

  registrarIconosCategoria(cats);

  const productos: Producto[] = prods.map((p) => ({
    id: p.id,
    categoriaId: p.categoriaId,
    nombre: p.nombre,
    precio: Number(p.precio),
    emoji: '🍽️', // el backend aún no maneja emoji por producto; se usa la imagen si existe
    estacion: p.estacion,
    imagen: p.imagenUrl ?? undefined,
    destacado: p.destacado,
    modificadores: p.gruposMod?.map((g) => g.grupoModificadorId) ?? [],
  }));

  const categorias: Categoria[] = cats.map((c) => ({ id: c.id, nombre: c.nombre, emoji: '', icono: c.icono ?? undefined }));

  return { productos, categorias };
}

export function useCatalogo() {
  return useQuery({
    queryKey: ['catalogo'],
    queryFn: cargarCatalogo,
    staleTime: 5 * 60 * 1000, // 5 min: el catálogo cambia poco
  });
}

/** Grupos de modificadores de la sucursal (tamaño, extras, término…). */
export function useModificadores() {
  return useQuery({ queryKey: ['modificadores'], queryFn: getModificadores, staleTime: 5 * 60 * 1000 });
}

/** Mutaciones de productos y categorías; invalidan el catálogo (lo re-sincroniza AppShell). */
export function useCatalogoMutations() {
  const qc = useQueryClient();
  const invalidar = () => qc.invalidateQueries({ queryKey: ['catalogo'] });
  return {
    crearProducto: useMutation({ mutationFn: (data: ProductoInput) => crearProducto(data), onSuccess: invalidar }),
    editarProducto: useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<ProductoInput> }) => editarProducto(id, data),
      onSuccess: invalidar,
    }),
    eliminarProducto: useMutation({ mutationFn: (id: string) => eliminarProducto(id), onSuccess: invalidar }),
    crearCategoria: useMutation({ mutationFn: (data: CategoriaInput) => crearCategoria(data), onSuccess: invalidar }),
    editarCategoria: useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<CategoriaInput> }) => editarCategoria(id, data),
      onSuccess: invalidar,
    }),
    eliminarCategoria: useMutation({ mutationFn: (id: string) => eliminarCategoria(id), onSuccess: invalidar }),
  };
}
